export const options = {
    timestamps: true, //insert created at updateat fields
    minimize: false, //prevent showing empty properties in database
    toObject: {
        virtuals: true, //include virtuals
        minimize: false
    }
};
