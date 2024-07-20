import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
    // connect to db
    await dbConnect()

    try {
        // get username and code
        const {username, code} = await request.json()

        // use this function so we can we get decoded version of query
        const decodedUsername = decodeURIComponent(username)

        // find user in db
        const user = await UserModel.findOne({username: decodedUsername})
        if(!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {
                    status: 404
                }
            )
        }
        
        // if user is alr verified then return response
        if(user.isVerified === true) {
            return Response.json(
                {
                    success: false,
                    message: "User already verified"
                },
                {
                    status: 400
                }
            )
        }

        // match the code and check code is not expired
        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()
        
        // if code is valid and not expired then verify user and clean fields
        if(isCodeValid && isCodeNotExpired) {
            user.isVerified = true
            await user.save()

            return Response.json(
                {
                    success: true,
                    message: "User verified successfully"
                },
                {
                    status: 200
                }
            )
        } else if (!isCodeNotExpired) {
            return Response.json(
                {
                    success: false,
                    message: "Verification code has expiried , please sign up again"
                },
                {
                    status: 400
                }
            )
        } else {
            return Response.json(
                {
                    success: false,
                    message: "Incorrect verification code"
                },
                {
                    status: 400
                }
            )
        }


    } catch (error) {
        console.error("Error while verifying user : ");
        return Response.json(
            {
                success: false,
                message: "Error while verifying user"
            },
            {
                status: 500
            }
        )
    }
}