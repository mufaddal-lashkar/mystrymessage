import dbConnect from "@/lib/dbConnect";
import UserModal from "@/model/User";
import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST (request: Request) {
    // connect db
    await dbConnect()

    try {
        // get data from json body
        const {username, email, password} = await request.json()

        // check if username is alr taken by verified user
        const existingUserVerifiedByUsername = await UserModal.findOne({
            username,
            isVerified: true
        })
        if(existingUserVerifiedByUsername) {
            return Response.json(
                {
                    success: false,
                    message: "Username already exists"
                },
                {
                    status: 400,
                }
            )
        }

        // check if email is alr in use
        const existingUserByEmail = await UserModal.findOne({email})

        // generate verify code
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if(existingUserByEmail) {
            if(existingUserByEmail.isVerified) {
                return Response.json(
                    {
                        success: false,
                        message: "User already exists with this email"
                    },
                    {
                        status: 400,
                    }
                )
            } else {
                const hashedPassword = await bcrypt.hash(password, 10)
                existingUserByEmail.password = hashedPassword
                existingUserByEmail.verifyCode = verifyCode
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                await existingUserByEmail.save()
            }
        } else {
            // encrypt password and set verify expiry to 1 hour
            const hashedPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)

            // save user
            const newUser = new UserModal({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: []
            })
            await newUser.save()
        }

        // send verification email
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )
        if(!emailResponse.success) {
            return Response.json(
                {
                    success: false,
                    message: emailResponse.message || "Failed to send verification email"
                }, 
                {
                    status: 500
                }
            )
        }
        return Response.json(
            {
                success: true,
                message: "Verification email sent"
            },
            {
                status: 201
            }
        )

    } catch (error) {
        // show error
        console.error('Error registering user : ', error);

        // return response
        return Response.json(
            {
                success: false,
                message: 'Error registering user'
            },
            {
                status: 500
            }
        )
    }
}