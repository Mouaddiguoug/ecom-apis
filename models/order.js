const orderModel = {
    userId: "",
    products: [
        {
            productId: "", 
            quantity: 1
        }
    ],
    amount: 0,
    userAdresses: {},
    status: "pendding",
    createdAt: Date.now()
}

export default orderModel;