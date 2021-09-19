const Admin = require('../model/admin');
const Token = require("../model/token");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

const crypto = require("crypto");


const JWTSecret = process.env.TOKEN_KEY;
const bcryptSalt = process.env.BCRYPT_SALT;
const clientURL = process.env.CLIENT_URL;





const login = async (req, res) => {

	try{
		console.log(req.body);
			// Get admin input
		    const { email, password } = req.body;

		    // Validate admin input
		    if (!(email && password)) {
		    	return res.send({err:1, message:"All input is required",success:false, data:{}});
		    }

		    // Validate if admin exist in our database
		    const admin = await Admin.findOne({ email });

		    if (admin && (await bcrypt.compare(password, admin.password))) {
		      // Create token
		      const token = jwt.sign(
		        { admin_id: admin._id, email },
		        process.env.TOKEN_KEY,
		        {
		          expiresIn: "2h",
		        }
		      );

		      // save user token
		      admin.token = token;
		      
		      const data = {
        		full_name : admin.full_name,
        		_id: admin._id,
        		email: admin.email,
       		  token: token 
       		 }
		      // admin
		     return res.json({err:0, message:"success",success:true, data:data});
		    }else{
		     return res.send({err:1, message:"User is not found!",success:false, data:{}});
		    }
	}
	catch(error){
		return res.status(400).json({message:error.message,success:false, data:{}});
	}
}

const register = async (req, res) => {


	try{
		console.log(req.body);
		 // Get user input
		 const { full_name, email, password, role_type } = req.body;

		 // Validate user input
		 if (!(password && email && full_name && role_type)) {
		  return res.json({err:1, message:'All input is required',success:false, data:{}});
		 }

		 // check if user already exist
		 // Validate if user exist in our database
		 const oldUser = await Admin.findOne({ email });

		 if (oldUser) {
			 console.log('err');
		   return res.json({err:1,message:"Email Already Exist. Please Login",success:false, data:{}});
		 }

		 //Encrypt user password
		 encryptedPassword = await bcrypt.hash(password, 10);

		 // Create user in our database
		 const user = await Admin.create({
		   full_name,
		   role_type,
		   email: email.toLowerCase(), // sanitize: convert email to lowercase
		   password: encryptedPassword,
		 });

		 // Create token
		 const token = jwt.sign(
		   { user_id: user._id, email },
		   process.env.TOKEN_KEY,
		   {
		     expiresIn: "2h",
		   }
		 );
		 // save user token
		 user.token = token;

		 // return new user
		 console.log('success');
		 return res.status(201).json({err:0,message:"success",success:true, data:{user}});

	}catch(error){
		return res.status(400).json({err:1,message:error.message,success:false, data:{}});
	}
}

const changePassword = async (req, res) => {

// Init Variables
try{
	var passwordDetails = req.body;

    if (passwordDetails.newPassword) {

    	const admin = await Admin.findById(passwordDetails.id );
     	console.log(passwordDetails);
     	console.log(admin);
        if (admin) {
          if (await bcrypt.compare(passwordDetails.currentPassword,admin.password))
          {
			  if(passwordDetails.currentPassword === passwordDetails.newPassword)
			  {
				return res.status(422).send({message: 'New password cannot be the same as old password.', success:false, data:{}});
			  }
			  else
			  {
				if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
					admin.password = await bcrypt.hash(passwordDetails.newPassword,10);
	  
					admin.save(function (err) {
					  if (err) {
						return res.status(422).send({message:err.message, success:false, data:{} });
					  }
					  else {
							return res.send({message: 'Password changed successfully', success:true, data:{}});
					  }
					});
				  } else {
					return res.status(422).send({message: 'Passwords do not match', success:false, data:{}});
				  }
			  }
          } else {
            return res.status(422).send({message: 'Current password is incorrect', success:false, data:{}}); }
        } else {
          return res.status(400).send({message: 'User is not found',success:false, data:{}});
        }
      
    } else {
      return res.status(422).send({message: 'Please provide a new password',success:false, data:{}});
    }
}
catch(ex)
{
	return res.status(422).send({message: ex.message, success:false, data:{}});
}
 
};

const requestPasswordReset = async (req,res) => {

  var email = req.body.email;
  console.log(req.body);	
  const admin = await Admin.findOne({ email });
  if (!admin){
  	 return res.send({err:1, message: 'Admin does not exist',success:false, data:{}});
  } 
  let token = await Token.findOne({ adminId: admin._id });
  if (token) await token.deleteOne();
  let resetToken = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));

  await new Token({
    adminId: admin._id,
    token: hash,
    createdAt: Date.now(),
  }).save();

 const link = `${clientURL}/#/reset-password?token=${resetToken}&param=a&id=${admin._id}`;
 console.log(link);
 // sendEmail(admin.email,"Password Reset Request",{name: admin.first_name,link: link,},"./template/requestResetPassword.handlebars");
 
 let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USERNAME, // generated ethereal user
      pass: process.env.EMAIL_PASSWORD, // generated ethereal password
    },
  });

  let info = await transporter.sendMail({
    from: 'eFreshway <praveenkumarmean@gmail.com>', // sender address
    to: admin.email, // list of receivers
    subject: "Password Reset", // Subject line
    //text: link, // plain text body
	html: `<strong>Hii : ${admin.full_name} </strong><br><br><p>Your Reset Request Email</p><br><br><a href="${link}">Click to Reset</a>`, // html body
  });

     return res.json({err:0,message: 'Password reset mail is Sent !',success:false }); 
  // return link;
};

const resetPasswordController = async (req, res, next) => {
	console.log(req.body);
  const resetPasswordService = await resetPassword(

    req.body.id,
    req.body.token,
    req.body.password,
    req.body.type
  );
  return res.json(resetPasswordService);
};

const resetPassword = async (adminId, token, password,type) => {

  let passwordResetToken = await Token.findOne({ adminId });
  console.log('type:',type );
  console.log('adminId:',adminId );
  console.log('token:', token);
  console.log('password:',password);
  console.log('passwordResetToken:', passwordResetToken);
  if (!passwordResetToken) {
    return {message: "Invalid or expired password reset token", success:false, data:{}};
  }
  const isValid = await bcrypt.compare(token, passwordResetToken.token);
  if (!isValid) {
    return {message: "Invalid or expired password reset token", success:false, data:{}};
  }
  const hash = await bcrypt.hash(password, Number(bcryptSalt));
  await Admin.updateOne(
    { _id: adminId },
    { $set: { password: hash } },
    { new: true }
  );
  const user = await Admin.findById({ _id: adminId });
  // sendEmail(user.email, "Password Reset Successfully", {name: user.first_name, }, "./template/resetPassword.handlebars");

  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USERNAME, // generated ethereal user
      pass: process.env.EMAIL_PASSWORD, // generated ethereal password
    },
  });

  let info = await transporter.sendMail({
    from: 'eFreshway <praveenkumarmean@gmail.com>', // sender address
    to: user.email, // list of receivers
    subject: "Password Reset", // Subject line
    text: "Password Reset Successfully", // plain text body
    //html: "<b>Hello world?</b>", // html body
  });

  await passwordResetToken.deleteOne();
  return {err:0, message: "Password Changed", success:false, data:{}}
};

module.exports = {

	login,
	register,
	changePassword,
	requestPasswordReset,
	resetPasswordController,

	
}