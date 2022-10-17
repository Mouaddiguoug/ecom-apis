export default class productModel{
    constructor (id, title, desc, img, categories, size, color, price, createdAt) {
        this.id = id;
        this.title = title;
        this.desc = desc;
        this.img = img;
        this.categories = categories;
        this.size = size;
        this.color = color;
        this.price = price;
        this.createdAt = createdAt;
    }
}