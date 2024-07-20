import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

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

    // get user id , covert from string to document id
    const userId = new mongoose.Types.ObjectId(user._id)

    // aggregate pipeline to get all messages of user
    try {
        const user = await UserModel.aggregate([
            { $match: { _id: userId } },
            { $unwind: '$messages' },
            { $sort: {'messages.createdAt': -1}},
            { $group: {_id: '$_id', messages: {$push: '$messages'}}},
        ])
        if(!user || user.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "user not found"
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
                message: "Fetched all messages successfully",
                messages: user[0].messages
            },
            {
                status: 200
            }
        )
    } catch (error) {
        console.error("Error while get all messages of user");
        return Response.json(
            {
                success: false,
                message: "Error while get all messages of user"
            },
            {
                status: 500
            }
        )
    }

}