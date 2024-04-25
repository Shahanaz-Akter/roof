
// delete session js
const deleteSessionProduct = async (id) => {
    console.log('deleteSessionProduct');
    console.log(id);
    let container = document.querySelector(`#productcartContainer_${id}`);
    // console.log(container);
    let response = await axios.post('/customer/delete_session_product', { id });
    // console.log(response);
    if (response.data.success == true) {
        container.remove();

    }
}

const change_quantity_value = async (reason, id, tag) => {
    //  console.log(value);
    //  console.log(id);
    //  console.log(tag);

    const response = await axios.post('/customer/product_increment', { product_id: id, reason: reason });
    // console.log(tag.parentNode);
    console.log(response);
    tag.parentNode.children[1].innerHTML = await response.data.qty;
    let total_holder = document.querySelector(`#price_without_discount_${id}`);
    total_holder.innerHTML = await response.data.price_without_discount;

    let subT_holder = document.querySelectorAll('.sub_total');
    console.log('subT_holder: ', subT_holder);

    Array.from(subT_holder).forEach(ele => {
        ele.innerHTML = response.data.sub_total;
    });

    // if (subT_holder) {
    //     subT_holder.innerHTML = response.data.sub_total;
    // }

}




