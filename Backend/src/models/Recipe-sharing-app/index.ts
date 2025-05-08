import type { Connection } from "mongoose"
import { connectMongoDb} from "../../config/database/mongo/index.js"
import { RECIPE_APP } from "../../constants.js"

const recipeDatabase = await connectMongoDb(RECIPE_APP)

const options = {
    timestamps: true,//insert created at updateat fields
    minimize: false, //prevent showing empty properties in database
    toObject: {
      virtuals: true, //include virtuals
      minimize: false
    }
  }

  export {
    options,
    recipeDatabase
  }
  

  
  