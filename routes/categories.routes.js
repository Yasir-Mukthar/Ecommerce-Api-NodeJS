import {Category} from '../models/category.model.js';
import {Router} from 'express';

const router = Router();

router.get('/categories', async (req, res) => {
    try {
        const categoryList = await Category.find();
        if (!categoryList) {
            return res.status(500).json({success: false, message: 'No category found'});
        }
        res.status(200).send(categoryList);
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
});

router.get("/categories/:id",async(req,res)=>{
    try {
        let id= req.params.id;
        const category=await Category.find(     {_id:id});

        if(!category){
            res.status(500).json({success:false,message:'no category found'});
        }
        else{
            res.status(200).send(category);
        }
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
})

router.post('/categories', async (req, res) => {
    try {
        let category = new Category({
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        });
        category = await category.save();
        if (!category) {
            return res.status(404).send('The category cannot be created');
        }
        res.send(category);
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
});


router.put("/categories/:id", async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        }, { new: true });

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({ success: true, message: 'Category updated successfully', category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
    


router.delete('/categories/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (category) {
            return res.status(200).json({success: true, message: 'The category is deleted'});
        } else {
            return res.status(404).json({success: false, message: 'Category not found'});
        }
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
});

export default router;
        
   
   


