import { connect } from "mongoose";
const mongo_uri = process.env.MONGO_URI
const connectMongoDb = async () =>
{
    try {
        await connect(mongo_uri.toString())
        console.log("connected to mongoDb ")
    } catch(err) {
        console.log(err)
        process.exit(1);
    } 
}
export default connectMongoDb