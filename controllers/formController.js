const from = require('../model/form')



const addForm = async (req, res) => {


    try {
        const { field1, field2, field3 } = req.body;
        const adminId = req.user._id
        // Validate user form
        if (!(field1 && field2 && field3)) {
            return res.status(400).json({ message: 'All input is required', success: false, data: {} });
        }



        // Create form in our database
        const formData = await from.create({
            adminId,
            field1,
            field2,
            field3,

        });



        return res.status(201).json({ message: "success", success: true, data: { formData } });

    } catch (error) {
        return res.status(400).json({ message: error.message, success: false, data: {} });
    }
}





const updateForm = async (req, res) => {


    try {
        const { field1, field2, field3 } = req.body;

        // Validate user form
        if (!(field1 && field2 && field3)) {
            return res.status(400).json({ message: 'All input is required', success: false, data: {} });
        }



        // Create form in our database


        const data={
            field1,
            field2,
            field3,
        }

        const formData = await from.findOneAndUpdate({adminId:req.user._id},data);



        return res.status(201).json({ message: "success", success: true, data: { formData } });

    } catch (error) {
        return res.status(400).json({ message: error.message, success: false, data: {} });
    }
}
module.exports = {

    addForm,
    updateForm


}