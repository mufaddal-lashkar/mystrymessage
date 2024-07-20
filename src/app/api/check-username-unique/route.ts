import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {z} from 'zod'
import { usernameValidation } from "@/schemas/signupSchema";

// zod validation schema
const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    // connect to db
    await dbConnect()

    try {
        // get username from query
        const {searchParams} = new URL(request.url)
        const queryParam = {
            username: searchParams.get('username')
        } // always keep in object

        // validate with zod
        const result = UsernameQuerySchema.safeParse(queryParam)

        // return errors if zod validation fails
        if(!result.success) {
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json(
                {
                    success: false,
                    message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : 'Invalid query parameters'
                },
                {
                    status: 400
                }
            )
        }

        // if zod validation complete then,
        const {username} = result.data
        const existingVerifiedUser = await UserModel.findOne({
            username,
            isVerified: true
        })
        if(existingVerifiedUser) {
            return Response.json(
                {
                    success: false,
                    message: 'Username is already taken'
                }
            )
        }

        return Response.json(
            {
                success: true,
                message: 'Username is available'
            },
            {
                status: 200
            }
        )
    } catch (error) {
        console.error("Error checking username : ", error);
        return Response.json(
            {
                success: false,
                message: "Error while checking username"
            },
            {
                status: 500
            }
        )
        
    }
}