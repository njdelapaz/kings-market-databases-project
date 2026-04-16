import {NextResponse} from 'next/server'
import db from '@/lib/db'

export async function POST(request){
    const {role, username, email} = await request.json(); //only using username, email for now.
    try{
        // check customers if role is customer.
        if(role == 'customer'){
            const [rows] = await db.query(
                `SELECT c2.Username, c2.Email
                FROM Customer_R2 c2
                WHERE c2.username = ? AND c2.Email = ?`,
                [username, email]
            )
            if(rows.length == 0){
                console.log(`Error. No customer account with username ${username} and email ${email} found.`);
                return NextResponse.json({message: "No account found with those details."});
            }
            console.log('Customer Query Result: ', rows);
            return NextResponse.json({ success: true, role: 'customer', user: rows[0] });
        }
        else if (role == 'storekeeper'){
            const [rows] = await db.query(
                `SELECT s2.Username, s2.Email
                FROM Storekeeper_R2 s2
                WHERE s2.username = ? AND s2.Email = ?`, 
                [username, email]
            )
            if(rows.length == 0){
                console.log(`Error. No storekeeper account with username ${username} and email ${email} found.`);
                return NextResponse.json({message: "No account found with those details."});
            }
            console.log('Storekeeper Query Result: ', rows);
            return NextResponse.json({ success: true, role: 'storekeeper', user: rows[0] });
        }
    } catch(err) {
        console.log("Error: ", err);
        return NextResponse.json({error: err}, {status: 500})
    }
}