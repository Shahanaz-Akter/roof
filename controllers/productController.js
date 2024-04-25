const asyncHandler = require('express-async-handler');
const bodyParser = require('body-parser');
const parentCategory = require('../models/parentcategory');
const subCategory = require('../models/subcategory');
const Category = require('../models/category');
let Product = require('../models/Product');


const { ObjectId } = require('mongodb');

// const addProduct = async (req, res) => {
//     let error1 = req.query.error1;
//     let error2 = req.query.error2;
//     let error3 = req.query.error3;
//     // console.log(error1);


//     let upc_code = '0000';
//     let timestamp = Date.now().toString(); // Get the current timestamp as a string
//     let sku_code = upc_code + timestamp;

//     res.render('product/add_product.ejs', { error1, error2, error3, sku_code, upc_code });
// };


const productList = async (req, res) => {
    let products = await Product.find({});
    res.render('product/product_list.ejs', { products });
}

const category = async (req, res) => {
    let upc_code = '1201';
    let record = await parentCategory.find({}); //all records

    let records = await Category.aggregate([
        {
            $addFields: {
                parent_category_id: { $toObjectId: "$parent_category_id" },
                sub_category_id: { $toObjectId: "$sub_category_id" }
            }
        },
        {
            $lookup: {
                from: "parentcategories",
                localField: "parent_category_id",
                foreignField: "_id",
                as: "parent_category"
            }
        },
        {
            $unwind: "$parent_category"
        },
        {
            $lookup: {
                from: "subcategories",
                localField: "sub_category_id",
                foreignField: "_id",
                as: "sub_category"
            }
        },
        {
            $unwind: "$sub_category"
        }
    ]);
    // console.log(records);

    let parent = await parentCategory.aggregate([
        {
            $lookup: {
                from: 'subcategories',
                localField: '_id',
                foreignField: 'parent_category_id',
                as: 'subcategories'
            }
        },
        {
            $unwind: "$subcategories" // Unwind the subcategories array
        },
        {
            $lookup: {
                from: 'categories',
                localField: 'subcategories._id',
                foreignField: 'sub_category_id',
                as: 'subcategories.categories'
            }
        },
        {
            $group: {
                _id: '$_id',
                parent_category: { $first: '$parent_category' },
                upc_code: { $first: '$upc_code' },
                category_image: { $first: '$category_image' },
                createdAt: { $first: '$createdAt' },
                __v: { $first: '$__v' },
                subcategories: { $push: '$subcategories' } // Push subcategories into an array
            }
        }
    ]);


    // console.log(parent);

    if (record.length > 0) {
        const latestCategory = await parentCategory.findOne({}).sort({ createdAt: -1 });
        let latest_upc_code = parseInt(latestCategory.upc_code);

        // latest_upc_code = isNaN(latest_upc_code) ? 0 : latest_upc_code;
        latest_upc_code++;

        // Ensure the UPC code is formatted as a 4-digit string with leading zeros
        upc_code = latest_upc_code.toString().padStart(4, '0');
        // console.log('Updated UPC: ', upc_code);
    }
    // Generate the timestamp
    let timestamp = Date.now().toString();

    // Concatenate the UPC code with the timestamp to create the SKU code
    let sku_code = upc_code + timestamp;

    // latestCategory.upc_code = parseInt(upc_code) + 1;
    // console.log(latestCategory.upc_code);

    // let record1 = await subCategory.find({});
    // let record2 = await Category.find({});

    // let filteredSubRecords = record2.filter(cate => record.some(parent => parent._id.equals(cate.parent_category_id)));
    // console.log(filteredSubRecords);

    res.render('product/category.ejs', { upc_code, sku_code, parent, records });
}

const postCategory = async (req, res) => {
    let parent_c_id, sub_c_id, c_id;

    let { parent_category, sub_category, category, upc_code } = req.body;
    // console.log(parent_category.length);

    try {
        let parent_cat = await parentCategory.findOne({ parent_category: parent_category });
        // console.log(parent_cat);

        let sub_cat = await subCategory.findOne({ sub_category: sub_category });
        // console.log(sub_cat);

        let cat = await Category.findOne({ category: category });
        // console.log(cat);

        let parent, category1, category2;

        if (!(parent_cat)) {

            parent = await parentCategory.create({
                category_image: req.files['category_image'] ? '/front_assets/new_images/' + req.files['category_image'][0].filename : null,
                parent_category: parent_category,
                upc_code: upc_code,
            });
            parent_c_id = parent._id;
        }
        else {
            parent_c_id = parent_cat._id;
        }

        if (!(sub_cat)) {
            category1 = await subCategory.create({
                parent_category_id: parent_c_id,
                sub_category: sub_category,
            });
            sub_c_id = category1._id;

        }
        else {
            sub_c_id = sub_cat._id;

        }

        if (!(cat)) {
            category2 = await Category.create({
                parent_category_id: parent_c_id,
                sub_category_id: sub_c_id,
                category: category,
            });
            c_id = category2._id;
        }

        else {
            c_id = cat._id; //no need
        }
        // console.log(parentCategory._id);

        // let category1 = await subCategory.create({
        //     parent_category_id: parent_cat._id,
        //     sub_category: sub_category,
        // });

        // let category2 = await Category.create({
        //     parent_category_id: parent._id,
        //     sub_category_id: category1._id,
        //     category: category,
        // });

        // res.redirect('/product/category');
    }
    catch (err) {
        console.log(err);
        res.redirect('/product/category');
    }

    res.redirect('/product/category');

}

const addProduct = async (req, res) => {
    // console.log('ssss');
    id = new ObjectId(req.params.id);
    // console.log(id);
    // let data = await Category.findById(id);
    // console.log(data);

    let data = await Category.aggregate([
        {
            $match: {
                _id: id // Assuming 'id' is the ID you're filtering on
            }
        },
        {
            $addFields: {
                parent_category_id: { $toObjectId: "$parent_category_id" },
                sub_category_id: { $toObjectId: "$sub_category_id" }
            }
        },
        {
            $lookup: {
                from: "parentcategories",
                localField: "parent_category_id",
                foreignField: "_id",
                as: "parent"
            }
        },
        {
            $unwind: "$parent"
        },
        {
            $lookup: {
                from: "subcategories",
                localField: "sub_category_id",
                foreignField: "_id",
                as: "sub"
            }
        },
        {
            $unwind: "$sub"
        }
    ]);

    // console.log('Data', data);
    let parent_cate = data[0].parent.parent_category;
    let sub_cate = data[0].sub.sub_category;
    let cate = data[0].category;

    let upc_code = data[0].parent.upc_code;
    let timestamp = Date.now().toString(); // Get the current timestamp as a string
    let sku_code = upc_code + timestamp;
    res.render('product/add_productt.ejs', { sku_code, upc_code, parent_cate, sub_cate, cate });
};

const manualAddProduct = async (req, res) => {
    // console.log('hi');
    // let data = await Category.find({});

    let data = await parentCategory.aggregate([
        {
            $lookup: {
                from: 'subcategories',
                localField: '_id',
                foreignField: 'parent_category_id',
                as: 'subcategories'
            }
        },
        {
            $unwind: "$subcategories" // Unwind the subcategories array
        },
        {
            $lookup: {
                from: 'categories',
                localField: 'subcategories._id',
                foreignField: 'sub_category_id',
                as: 'subcategories.categories'
            }
        },
        {
            $group: {
                _id: '$_id',
                parent_category: { $first: '$parent_category' },
                upc_code: { $first: '$upc_code' },
                category_image: { $first: '$category_image' },
                createdAt: { $first: '$createdAt' },
                __v: { $first: '$__v' },
                subcategories: { $push: '$subcategories' } // Push subcategories into an array
            }
        }
    ]);

    // console.log('full data ', data);
    // console.log('sub categories ', data[0].subcategories);
    // console.log('categories ', data[0].subcategories[0].categories);
    // console.log(data[0].subcategories);

    res.render('product/add_product.ejs', { parent: data });
};

const postAddProduct = async (req, res) => {
    try {
        let sku, upc;
        let { sku_code, upc_code, name, brand, color, parent_category, sub_category, category, product_type, buying_price, selling_price, discount, date, total_qty, price, old_price, description, colorVariants, sizeVariants } = req.body;
        let sec_img = [];
        parent_category = parent_category.trim(); //for reduing extra space from a string
        let img = req.files['secondary_image'];

        if (img) {
            img.forEach(element => {
                // console.log('/front_assets/new_images/' + element.filename);
                sec_img.push('/front_assets/new_images/' + element.filename);
            });
        } else {
            console.log('No files uploaded with the name "secondary_image"');
        }

        let latestCategory = await parentCategory.findOne({}).sort({ createdAt: -1 });
        console.log(latestCategory);

        if (upc_code == '') {
            if (latestCategory == null) {
                upc = '1201';
                let timestamp = Date.now().toString();
                sku = upc + timestamp;
            }
            else {
                let latest_upc_code = parseInt(latestCategory.upc_code);
                latest_upc_code++;
                upc = latest_upc_code.toString();
                let timestamp = Date.now().toString();
                sku = latest_upc_code + timestamp;
                // console.log(upc);
            }
        }

        //Global Variable
        let parent_c_id, sub_c_id, c_id;
        let parent_c_name, sub_c_name, c_name;
        let parent, category1, category2;

        let parent_cat = await parentCategory.findOne({ parent_category: parent_category });
        let sub_cat = await subCategory.findOne({ sub_category: sub_category });
        let cat = await Category.findOne({ category: category });

        if (!(parent_cat)) {
            parent = await parentCategory.create({
                category_image: req.files['category_image'] ? '/front_assets/new_images/' + req.files['category_image'][0].filename : null,
                parent_category: parent_category,
                upc_code: upc_code ? upc_code : upc,
            });

            parent_c_id = parent._id;
            parent_c_name = parent.parent_category;
        }

        else {
            parent_c_id = parent_cat._id;
            parent_c_name = parent_cat.parent_category;
        }

        if (!(sub_cat)) {
            category1 = await subCategory.create({
                parent_category_id: parent_c_id,
                sub_category: sub_category,
            });
            sub_c_id = category1._id;
            sub_c_name = category1.sub_category;
        }
        else {
            sub_c_id = sub_cat._id;
            sub_c_name = sub_cat.sub_category;

        }
        if (!(cat)) {
            category2 = await Category.create({
                parent_category_id: parent_c_id,
                sub_category_id: sub_c_id,
                category: category,
            });
            c_id = category2._id;
            c_name = category2.category;
        }

        else {
            c_id = cat._id; //no need
            c_name = cat.category;
        }

        let result = {
            'sku_code': sku_code ? sku_code : sku,
            'upc_code': upc_code ? upc_code : upc,
            'name': name,
            'brand': brand,
            'color': color,
            'parent_category': parent_category ? parent_c_name : null,
            'sub_category': sub_category ? sub_c_name : null,
            'category': category ? c_name : null,
            'product_type': product_type ? product_type : null,
            'buying_price': buying_price,
            'selling_price': selling_price,
            'discount': discount ? discount : null,
            'date': date,
            'total_qty': total_qty ? total_qty : null,
            'price': price ? price : null,
            'category_image': req.files['category_image'] ? '/front_assets/new_images/' + req.files['category_image'][0].filename : null,
            'old_price': old_price ? old_price : null,
            'primary_image': req.files['primary_image'] ? '/front_assets/new_images/' + req.files['primary_image'][0].filename : null,
            'secondary_image': sec_img ? sec_img : null,
            'description': description ? description : null,
            'colorVariants': colorVariants ? colorVariants : null,
            'sizeVariants': sizeVariants ? sizeVariants : null,
            'product_code': Math.floor(Math.random() * 1000) + 1,
        }

        // console.log(result);
        await Product.create(result);

        // let newCategory = await parentCategory.create({
        //     category_image: req.files['category_image'] ? '/front_assets/new_images/' + req.files['category_image'][0].filename : null,
        //     parent_category: parent_category,
        //     sub_category: sub_category,
        //     category: category,
        //     upc_code: upc_code ? upc_code : upc,
        // });
        res.redirect('/product/product_list');
    }

    catch (err) {
        console.log("Error: ", err);
    }
}

// from axios calling
const getCategory = async (req, res) => {
    console.log('inside get category')
    let upc_code;
    try {
        let { tagInnerText } = req.body;

        // console.log(tagInnerText);
        let category = await parentCategory.findOne({ parent_category: tagInnerText });
        // console.log(category)
        if (category) {
            console.log('Exist Upc', category.upc_code);
            upc_code = category.upc_code;
        }

        // Fetch category data from the database here   
        res.send({
            success: true,
            u_code: upc_code,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


const allProduct = async (req, res) => {

    try {
        let parent = await parentCategory.aggregate([
            {
                $lookup: {
                    from: 'subcategories',
                    localField: '_id',
                    foreignField: 'parent_category_id',
                    as: 'subcategories'
                }
            },
            {
                $unwind: "$subcategories" // Unwind the subcategories array
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'subcategories._id',
                    foreignField: 'sub_category_id',
                    as: 'subcategories.categories'
                }
            },
            {
                $group: {
                    _id: '$_id',
                    parent_category: { $first: '$parent_category' },
                    upc_code: { $first: '$upc_code' },
                    category_image: { $first: '$category_image' },
                    createdAt: { $first: '$createdAt' },
                    __v: { $first: '$__v' },
                    subcategories: { $push: '$subcategories' } // Push subcategories into an array
                }
            }
        ]);

        let product_id = req.params.id;
        let category = req.params.cate_name;
        // console.log(product_id, category);

        let records = await Product.find({ category: category });
        // console.log(record);
        res.render('product/all_product.ejs', { records, parent });

    }
    catch (err) {
        console.log(err);
    }
}
const all_Produc = async (req, res) => {
    try {

        res.render('product/all_product.ejs');
    }
    catch (err) {
        console.log(err);
    }
}

const ProductDetails = async (req, res) => {

    try {
        let parent = await parentCategory.aggregate([
            {
                $lookup: {
                    from: 'subcategories',
                    localField: '_id',
                    foreignField: 'parent_category_id',
                    as: 'subcategories'
                }
            },
            {
                $unwind: "$subcategories" // Unwind the subcategories array
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'subcategories._id',
                    foreignField: 'sub_category_id',
                    as: 'subcategories.categories'
                }
            },
            {
                $group: {
                    _id: '$_id',
                    parent_category: { $first: '$parent_category' },
                    upc_code: { $first: '$upc_code' },
                    category_image: { $first: '$category_image' },
                    createdAt: { $first: '$createdAt' },
                    __v: { $first: '$__v' },
                    subcategories: { $push: '$subcategories' } // Push subcategories into an array
                }
            }
        ]);

        let product_id = req.params.id;
        // console.log('product_id: ', product_id);

        let records = await Product.findById(new ObjectId(product_id));
        let reviews = [];

        // console.log('records: ', records);
        res.render('product/product_details.ejs', { parent, records, reviews });

    }
    catch (err) {
        console.log(err);
    }
}
const cart = async (req, res) => {
    try {
        let parent = await parentCategory.aggregate([
            {
                $lookup: {
                    from: 'subcategories',
                    localField: '_id',
                    foreignField: 'parent_category_id',
                    as: 'subcategories'
                }
            },
            {
                $unwind: "$subcategories" // Unwind the subcategories array
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'subcategories._id',
                    foreignField: 'sub_category_id',
                    as: 'subcategories.categories'
                }
            },
            {
                $group: {
                    _id: '$_id',
                    parent_category: { $first: '$parent_category' },
                    upc_code: { $first: '$upc_code' },
                    category_image: { $first: '$category_image' },
                    createdAt: { $first: '$createdAt' },
                    __v: { $first: '$__v' },
                    subcategories: { $push: '$subcategories' } // Push subcategories into an array
                }
            }
        ]);
        res.render('product/cart.ejs', { parent, locals: { session: req.session } });
    }
    catch (err) {
        console.log(err);
    }
}

const social = async (req, res) => {
    try {

        res.render('user/social.ejs', { parent });
    }
    catch (err) {
        console.log(err);
    }
}
const hotTrends = async (req, res) => {
    try {

        res.render('user/hot_trends.ejs', { parent });
    }
    catch (err) {
        console.log(err);
    }
}
const checkout = async (req, res) => {
    try {

        res.render('user/checkout.ejs', { parent });
    }
    catch (err) {
        console.log(err);
    }
}
const portFolio = async (req, res) => {
    try {

        res.render('user/port_folio.ejs', { parent });
    }
    catch (err) {
        console.log(err);
    }
}

module.exports = {
    productList, category, postAddProduct, addProduct, manualAddProduct, postCategory, getCategory, allProduct, all_Produc, ProductDetails, cart, social, hotTrends, checkout, portFolio
}
