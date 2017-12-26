module.exports = {
  database: process.env.MONGODB_URI 
  || 'mongodb://heroku_kpr4csbt:s3of4niqi8p19u93fl0ao9htqt@ds163016.mlab.com:63016/heroku_kpr4csbt' 
  || 'localhost/nef'
};