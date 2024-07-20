import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function POST(request: Request) {
    // connect to db
    await dbConnect()

    // extract user from session, error if user not found
    const session = await getServerSession(authOptions)
    const user: User = session?.user as User
    if(!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "You are not authenticated"
            },
            {
                status: 401
            }
        )
    }

    // get user id , get acceptMessages Flag from request
    const userId = user._id
    const {acceptMessages} = await request.json()

    try {
        // find and update user, error if user not found
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {isAcceptingMessages: acceptMessages},
            {new: true}
        )
        if(!updatedUser) {
            return Response.json(
                {
                    success: false,
                    message: "Failed to update user status to accept messages",
                },
                {
                    status: 401
                }
            )
        }

        // return response
        return Response.json(
            {
                success: true,
                message: "Successfully updated user status to accept messages",
                updatedUser
            },
            {
                status: 200
            }
        )
    } catch (error) {
        console.error("Failed to update user status to accept messages : ", error);
        return Response.json(
            {
                success: false,
                message: "Failed to update user status to accept messages"
            },
            {
                status: 500
            }
        )
    }
}

export async function GET(request: Request) {
    // connect to db
    await dbConnect()

    // extract user from session, error if user not found
    const session = await getServerSession(authOptions)
    const user: User = session?.user as User
    if(!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "You are not authenticated"
            },
            {
                status: 401
            }
        )
    }

    // get user id and find user, error if not found
    const userId = user._id
    try {
        const foundUser = await UserModel.findById(userId)
        if(!foundUser) {
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
    
        // return response
        return Response.json(
            {
                success: true,
                message: "isAccepting message flag fetched successfully",
                isAcceptingMessages: foundUser.isAcceptingMessages
            },
            {
                status: 200
            }
        )
    } catch (error) {
        console.error("Error while fetching isAccepting messages flag of user : ", error);
        return Response.json(
            {
                success: false,
                message: "Error while fetching isAccepting messages flag of user"
            },
            {
                status: 500
            }
        )
    }
}