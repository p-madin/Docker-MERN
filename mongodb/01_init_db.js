db = db.getSiblingDB('stackDB');

db.createUser(
  {
    user: "app_user",
    pwd: "app_password",
    roles: [ { role: "readWrite", db: "stackDB" } ]
  }
);

db.appUsers.insertMany([
  { name: "Amy", age: 30, city: "Sydney", username: "amy_syd", password: "a_syd", email: "a@syd.com.au", dateAdded: new Date(), dateVerified: new Date()},
  { name: "Brief", age: 25, city: "Hobart", username: "bri_hob", password: "b_hob", email: "a@syd.com.au", dateAdded: new Date(), dateVerified: new Date()},
  { name: "Calorine", age: 35, city: "Tasmania", username: "cal_tas", password: "c_tas", email: "a@syd.com.au", dateAdded: new Date(), dateVerified: new Date()},
]);