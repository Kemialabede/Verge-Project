const queries = {
    addNewUser: `
    INSERT INTO verge(
        first_name,
        last_name,
        email,
        password,
        state,
        type
    ) VALUES($1, $2, $3, crypt( $4, gen_salt('bf')), $5, $6) RETURNING *`,
    findUserByEmail: `
        SELECT * FROM verge WHERE email = ($1)`,
    findUserByEmailPassword:`
    SELECT * FROM verge WHERE email =($1) AND password =crypt($2, password)`,
    addNewParcel: `
    INSERT INTO userparcel(
        user_id,
        price,
        weight,
        location,
        destination,
        sender_name,
        sender_note,
        status,
        created_at,
        updated_at
    ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    selectadminById:`
    SELECT is_admin FROM verge WHERE id=($1)`,
    findParcelByUserId: `
    SELECT * FROM userparcel WHERE user_id=($1)`,
    getAParcelByUserIdAndParcelId: `
    SELECT * FROM userparcel WHERE user_id=($1) AND id=($2)`,
    updateDestinationById:`
    UPDATE userparcel SET destination=($1), updated_at=($2) WHERE id=($3)
    `,
    findUserIdByParcelId:`
    SELECT user_id FROM userparcel WHERE id=($1)
    `,
    findAllParcels: `
    SELECT * FROM userparcel
    `,
    findStatusByParcelId:`
    SELECT status FROM userparcel WHERE id=($1)
    `,
    updateStatusById: `
    UPDATE userparcel SET status=($1), updated_at=($2) WHERE id=($3)
    `,
    changeLocationById: `
    UPDATE userparcel SET location=($1) WHERE id=($2)
    `,
    deleteParcel: `
    DELETE FROM userparcel WHERE id=($1)      
  `,
};


module.exports = queries;