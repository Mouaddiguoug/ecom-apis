export default class user{
    constructor (userId, username, name, email, password, isAdmin = false, createdAt) {
        this.userId = userId;
        this.username = username;
        this.name = name;
        this.email = email;
        this.password = password;
        this.isAdmin = isAdmin;
        this.createdAt = createdAt;
    }
}


