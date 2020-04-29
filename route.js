const express =require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const {
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

} = require("./vergeservice")

router.post(
    "/auth/signup",
    (req, res, next) => {
        const { first_name, last_name, email, password, state } = req.body
        if(!first_name || !last_name || !email || !password || !state ) {
            return res.status(400).json({
                message: "Please fill all fields",
            })
        }
        next();
    },
    async (req, res) => {
        const is_admin = "NO";
        const { email } = req.body;
        try {
            await checkIfEmailDoesNotExist(email);
            const result = await createNewUser(req.body, is_admin)
            return res.status(201).json(result);
        } catch (e) {
            console.log(e)
            return res.status(e.code).json(e);
        }
    }   
);


router.post(
    "/auth/admin/signup",
    (req, res, next) => {
        const { first_name, last_name, email, password, state } = req.body
        if(!first_name || !last_name || !email || !password || !state ) {
            return res.status(400).json({
                message: "Please fill all fields",
            })
        }
        next();
    },
    async (req, res) => {
        const is_admin = "YES";
        const { email } = req.body;
        try {
            await checkIfEmailDoesNotExist(email);
            const result = await createNewUser(req.body, is_admin)
            return res.status(201).json(result);
        } catch (e) {
            console.log(e)
            return res.status(e.code).json(e);
        }
    }   
);


router.post(
    "/auth/login",
    (req, res, next) => {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({
                message: "Please fill all fields"
              });
        }
        next();
    },
     async (req, res) => {
         console.log("faith")
        const { email, password } = req.body;
        console.log("fate")
        try {
            console.log("check")
            const result = await checkIfUserExist(email, password);
            const token = jwt.sign({id: result.id, is_admin: result.admin}, process.env.SECRET_TOKEN)
            res.header("auth", token).json({...result, token})
                console.log("next")
          return res.status(200).json(result)
        } catch (e) {
            console.log(e)
          return res.status(e.code).json(e);
        }
      }
    
)


router.post(
    "/parcel",
    (req, res, next) => {
        const { price, weight, location, destination, sender_name, sender_note } = req.body

        if( !price || !weight || !location || !destination || !sender_name || !sender_note) {
            console.log("temi")
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }
        next();
    },
      authVerification,
      async (req, res) => {
        try {
            await authorisationById(req.user.is_admin, "NO")
            const result = await createNewParcel(req.body, req.user.id);
            return res.status(201).json(result);
        } catch (e) {
            return res.status(e.code).json(e);
        }
    }
)


router.get(
    "/parcel",
    authVerification,
     async(req, res) => {
         const user_id = req.user.id;
        try{
            const result = await getParcelsByUserId(user_id);
            return res.status(200).json(result)
        } catch (e) {
            return res.status(e.code).json(e)
        }
    })


router.get(
    "/parcel/all",
    authVerification,
    async (req, res) => {
        try {
            await authorisationById(req.user.is_admin, "YES")
            const result = await getAllParcels();
            return res.status(200).json(result);
        } catch (e) {
            console.log(e);
            return res.status(e.code).json(e);
        }

    }
)


router.get(
    "/parcel/:id", 
    (req, res, next) => {
        const { id } = req.params;
        if (!parseInt(id)) {
            return res.status(400).json({
                message: "Id is not an integer"
            });
        }
        next();
    },
      authVerification,
      async (req, res) => {
          const user_id = req.user.id
          const { id } = req.params;
        try {
        await authorisationById(req.user.is_admin, "NO")
        const result = await getParcelByUserIdAndParcelId(user_id, id)
            return res.status(201).json({result});
        } catch (e) {
            return res.status(e.code).json(e);
        }
    }
)


router.put(
    "/parcel/destination/change/:id",
    (req, res, next) =>{
        const { destination } = req.body;
        if(!destination){
            return res.status(400).json({
                message: "Please fill all fields",
            })
        }
        next();
    },
    authVerification,
    async (req, res) => {
        const { id } = req.params;
        const { destination } = req.body;
        try {
            await authorisationById(req.user.is_admin, "NO")
            const result = await changeDestination(id, destination);
            return res.status(200).json(result);
        } catch (e) {
            console.log(e);
            return res.status(e.code).json(e);
        }
    }
)


router.delete(
    "/parcel/cancel/:id",
    (req, res, next) => {
        const { status } = req.body;
        if(!status){
            return res.status(401).json({
                message: "Please fill all fields",
            })
        }
        next();
    },
    authVerification,
    async (req, res, next) =>{
        const { status } = req.body;
        const { id } = req.params;
        try{
            await authorisationById(req.user.is_admin, "NO")
            const result =await deleteParcel(id);
            return res.status(201).json({
                message: "Deleted successfully"
            })
        } catch(e) {
            console.log(e);
            return res.status(e.code).json(e);
        }
    }
    
)


router.put(
    "/parcel/status/change/:id",
    (req, res, next) => {
        const { status } = req.body;
        if(!status){
            return res.status(400).json({
                message: "Please fill all fields",
            })
        }
        next();
    },
    authVerification,
    async (req, res, next) =>{
        try{
            await authorisationById(req.user.is_admin, "YES")
            const thisFunction = "Change status"
            await checkParcelStatus(req.params.id, thisFunction);
        } catch(e) {
            return res.status(e.code).json(e);
        }
        next();
    },
    async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        try {
            const result = await changeStatus(id, status);
            return res.status(200).json(result);
        } catch (e) {
            console.log(e);
            return res.state(e.code).json(e);
        }

    }
)


router.put(
    "/parcel/location/change/:id",
    (req, res, next) => {
        const { location } = req.body;
        if(!location){
            return res.status(400).json({
                message: "Please fill all fields",
            })
        }
        next();
    },
    authVerification,
    async (req, res, next) =>{
        try{
            await authorisationById(req.user.is_admin, "YES")
            const thisFunction = "Change Location"
            await checkParcelStatus(req.params.id, thisFunction);
        } catch(e) {
            return res.status(e.code).json(e);
        }
        next();
    },
    async (req, res) => {
        const { id } = req.params;
        const { location } = req.body;

        try {
            const result = await changeLocation(id, location);
            return res.status(200).json(result);
        } catch (e) {
            console.log(e);
            return res.state(e.code).json(e);
        }

    }
)

module.exports = router;