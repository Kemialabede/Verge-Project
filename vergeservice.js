const moment = require("moment");
const queries = require("./query");
const db = require("./database");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


async function createNewUser(body, type) {
    const { first_name, last_name, email, password, state} = body;
    const queryObj = {
        text: queries.addNewUser,
        values: [ first_name, last_name, email, password, state, type],
    };

    try {
        const { rowCount } = await db.query(queryObj)
        if (rowCount == 0) {
            return Promise.reject({
              status: "error",
              code: 500,
              message: "Could not sign up",
            });
          }
          if (rowCount > 0) {
            return Promise.resolve({
              status: "success",
              code: 201,
              message: "Signup successful"
            });
          }
        } catch (e) {
          console.log(e);
          return Promise.reject({
            status: "error",
            code: 400,
            message: "Error creating user",
          });
    }
}

async function checkIfEmailDoesNotExist(email) {
  const queryObj = {
    text: queries.findUserByEmail,
    values: [email],
  };
  try {
    console.log("kemi")
    const { rowCount } = await db.query(queryObj);
    console.log("ayo")
    if (rowCount == 0) {
      console.log("funmi")
      return Promise.resolve()
    }
    if (rowCount > 0) {
      return Promise.reject({
        status: "error",
        code: 400,
        message: "Email Already Exists"
      });
    }
  } catch (e) {
    console.log(e)
    return Promise.reject({
      status: "error",
      code: 500,
      message: "Invalid email"
    });
  }
}
async function checkIfUserExist(email, password) {
  const queryObj = {
    text: queries.findUserByEmailPassword,
    values: [email, password],
  };
  try {
    const { rows, rowCount } = await db.query(queryObj)
    if (rowCount > 0) {
      return Promise.resolve({
        status: "success",
        code: 200,
        message: "Login...",
        id: rows[0].id,
        type: rows[0].type,
        data: rows
      });
    }
    if (rowCount == 0) {
      return Promise.reject({
        status: "error",
        code: 400,
        message: "Could not find details"
      });
    }
  
  } catch (e) {
    console.log("ife")
  return Promise.reject({
    status: "error",
    code: 400,
    message: "Error finding User"
  });
 }
}

async function authVerification(req, res, next){
    const { auth } = req.headers;
    const token = auth;
    if(!token) {
        console.log("apple")
        return res.status(403).json({
            status: "forbidden",
            code: 403,
            message: "Unauthenticated Access",
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_TOKEN)
        req.user = decoded;
        console.log(req.user);
    } catch(e){
        return res.status(400).json({
            status: "error",
            code: 400,
            message: "Invalid Token",
        })
    }
    next()
}

async function createNewParcel(body, user_id) {
  const d = new Date();
  const created_at = moment(d).format("YYYY-MM-DD HH:mm:ss");
  const { price, weight, location, destination, sender_name, sender_note } = body
  const status = "Pending";
  const queryObj = {
    text: queries.addNewParcel,
    values: [ user_id, price, weight, location, destination, sender_name, sender_note, status, created_at, created_at],
};
try {
  const { rowCount } = await db.query(queryObj);
  if (rowCount == 0) {
      return Promise.reject({
        status: "error",
        code: 500,
        message: "Could not create parcel order"
      });
    }
    if (rowCount > 0) {
      return Promise.resolve({
        status: "success",
        code: 201,
        message: "Parcel delivery created"
      });
    }
  } catch (e) {
    console.log(e);
    return Promise.reject({
      status: "error",
      code: 400,
      message: "Error creating parcel delivery"
    });
  }
}
async function authenticateById(id){
  const queryObj = {
    text: queries.selectadminById,
    values: [id],
  }
  try {
    const { rowCount } = await db.query(queryObj);
        if (rowCount == 0) {
            return Promise.reject({
                status: "forbidden",
                code: 403,
                message: "This user is not authenticated on this platform "
            })
        }

        if (rowCount > 0) {
            return Promise.resolve();
        }
    } catch (e) {
        console.log(e);
        return Promise.reject({
            status: "error",
            code: 409,
            message: "Error authenticating user",
        });
    }

}
async function authorisationById(adminfromtoken, role){
  try{
      console.log(adminfromtoken)
      console.log(role)
      if (adminfromtoken == role){
          return Promise.resolve();
      }

      if (adminfromtoken!= role) {
          return Promise.reject({
              status: "unauthorised",
              code: 401,
              message: "This user is not authorised to carry out this function",
          })
      }
  } catch(e) {
      return Promise.reject({
          status: "error",
          code: 500,
          message: "Error authenticating user",
      })
  }
}

async function getParcelsByUserId(user_id) {
  const queryObj = {
    text: queries.findParcelByUserId,
    values: [user_id], 
  };
  try {
    const { rows } = await db.query(queryObj);
    return Promise.resolve({
      status: "success",
      code: 200,
      message: "Successfully fetched parcel by id",
      data: rows,
    });
  } catch (e) {
    return Promise.reject({
      status: "error",
      code: 500,
      message: "Error fetching all parcel id",
    });
  }
}
async function getParcelByUserIdAndParcelId(user_id, id) {
  const queryObj = {
    text: queries.getAParcelByUserIdAndParcelId,
    values: [user_id, id],
  };
  try {
    const { rows, rowCount } = await db.query(queryObj);
    if (rowCount == 0) {
      return Promise.reject({
        status: "error",
        code: 400,
        message: "Parcel delivery with id not found",
      });
    }
    if (rowCount > 0) {
      return Promise.resolve({
        status: "success",
        code: 200,
        message: "Parcel gotten successfully",
        parcels: rows,
      });
    }
  } catch (e) {
    return Promise.reject({
      status: "error",
      code: 400,
      message: "Error finding parcel",
    });
  }
}
async function getAllParcels(){
  const queryObj = {
    text: queries.findAllParcels
  };
  try{
      console.log("dog")
    const { rows} = await db.query(queryObj);
    return Promise.resolve({
      status: "success",
      code: 200,
      message: "Fetched all blogs successfully",
      data: rows,
    });
  }  catch(e) {
     return Promise.reject({
       status: "error",
       code: 500,
       message: "Error fetching parcel"
     })
  }
}
async function changeDestination(id, destination){
    const d = new Date();
    const updated_at = moment(d).format("YYYY-MM-DD HH:mm:ss");
    const queryObj = {
      text: queries.updateDestinationById,
      values: [destination, updated_at, id],
  }

  try{
      const { rowCount } = await db.query(queryObj);
      if (rowCount == 0){
          return Promise.reject({
              status: "error",
              code: 500,
              message: "parcel not found",
          });
      }
      if(rowCount > 0){
          return Promise.resolve({
              status: "success",
              code: 200,
              message: "Destination changed successfully",
          })
      }
  } catch (e){
      console.log(e);
      return Promise.reject({
          status: "error",
          code: 500,
          message: "Error changing Destination",
      })
  }
}

async function parcelauthorisation(id_parcel, id_user ){
  const queryObj = {
      text: queries.findUserIdByParcelId,
      values: [id_parcel],
  }

  try{
      const { rows, rowCount } = await db.query(queryObj);
      if(rowCount == 0){
          return Promise.reject({
              status: "error",
              code: 500,
              message: "Parcel with this id does not exist"
          })
      }
      if (rows[0].user_id == id_user){
          return Promise.resolve();
      }

      if (rows[0].user_id != id_user){
          return Promise.reject({
              status: "unauthorised",
              code: 401,
              message: "User is not authorised to access this parcel",
          })
      }
  } catch (e){
      console.log(e);
      return Promise.reject({
          status: "error",
          code: 500,
          message: "Error with parcel authorisation",
      })
  }
}
async function checkParcelStatus(id_parcel, cancelOrder){
  const queryObj = {
      text: queries.findStatusByParcelId,
      values: [id_parcel],
  }

  try {
      const { rows, rowCount } = await db.query(queryObj);
      if(rowCount == 0){
          return Promise.reject({
              status: "error",
              code: 500,
              message: "Parcel does not exist"
          })
      }
      if (rows[0].status == "Delivered" || rows[0].status == "Cancelled") {
          return Promise.reject({
              status: "error",
              code: 500,
              message: "Cannot cancel Order "
          })
      }

      if (rows[0].status != "Delivered" && rows[0].status != "Cancelled") {
          return Promise.resolve();
      }
  } catch (e) {
      console.log(e);
      return Promise.reject({
          status: "error",
          code: 500,
          message: "Error with status authorisation"
      })
  }
}
async function changeStatus (id, status) {
    const d = new Date();
    const updated_at = moment(d).format("YYYY-MM-DD HH:mm:ss");
  const queryObj = {
      text: queries.updateStatusById,
      values: [status, updated_at, id],
  }

  try{
      const { rowCount } = await db.query(queryObj);
      if ( rowCount == 0){
          return Promise.reject({
              status: "error",
              code: 500,
              message: "Parcel with id not found",
          })
      }
      if(rowCount > 0){
          return Promise.resolve({
              status: "success",
              code: 200,
              message: "Status Changed successfully",
          })
      }
  } catch (e){
      console.log(e);
      return Promise.reject ({
          status: "error",
          code: 500,
          message: "Error changing Status",
      })
  }
}

async function changeLocation (id, location) {
  const queryObj = {
      text: queries.updateLocationById,
      values: [location, id],
  }

  try{
      const { rowCount } = await db.query(queryObj);
      if ( rowCount == 0){
          return Promise.reject({
              status: "error",
              code: 500,
              message: "Parcel with id not found",
          })
      }
      if(rowCount > 0){
          return Promise.resolve({
              status: "success",
              code: 200,
              message: "location Changed successfully",
          })
      }
  } catch (e){
      console.log(e);
      return Promise.reject ({
          status: "error",
          code: 500,
          message: "Error changing location",
      })
  }
}
async function changeLocation (id, location) {
    const queryObj = {
        text: queries.changeLocationById,
        values: [location, id],
    }

    try{
        const { rowCount } = await db.query(queryObj);
        if ( rowCount == 0){
            return Promise.reject({
                status: "error",
                code: 500,
                message: "Parcel not found",
            })
        }
        if(rowCount > 0){
            return Promise.resolve({
                status: "success",
                code: 200,
                message: "Changed location successfully",
            })
        }
    } catch (e){
        console.log(e);
        return Promise.reject ({
            status: "error",
            code: 500,
            message: "Error changing location",
        })
    }
}
async function deleteParcel(id) {
    const queryObj = {
        text: queries.deleteParcel,
        values: [id],
    };
    try {
        const { rowCount } = await db.query(queryObj);
        if (rowCount == 0) {
            return Promise.reject({
                status: "erorr",
                code: 500,
                message: "Parcel order not found",
            });
        }
        if (rowCount > 0) {
            return Promise.resolve({
                status: "success",
                code: 200,
                message: "Deleted successfully",
            });
        }
    } catch (e) {
        return Promise.reject({
            status: "error",
            code: 500,
            message: "Error deleting parcel",
        });
    }
}




module.exports = {
    createNewUser,
    checkIfEmailDoesNotExist,
    checkIfUserExist,
    createNewParcel,
    authorisationById,
    authenticateById,
    getParcelByUserIdAndParcelId,
    changeDestination,
    parcelauthorisation,
    getParcelsByUserId,
    getAllParcels,
    checkParcelStatus,
    changeStatus,
    changeLocation,
    deleteParcel,
    authVerification
    
}
