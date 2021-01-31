module.exports = {
  database: process.env.MONGODB_URI 
  || 'mongodb+srv://mavimdev:1BmkfPHjvL21z3xv@cluster0.dc0km.mongodb.net/francesinhasdb?retryWrites=true&w=majority' 
  || 'localhost/nef'
};
