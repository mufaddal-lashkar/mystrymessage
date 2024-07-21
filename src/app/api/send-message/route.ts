import UserModel,{ Message } from "@/model/User";
import dbConnect from "@/lib/dbConnect";

export async function POST(request: Request) {
    // connect to db
    await dbConnect()

    // get data from request
    const {username, content} = await request.json()

    try {
        // find user if not found then error
        const user = await UserModel.findOne({username})
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

        // check if user is accepting messages if not return error
        if(!user.isAcceptingMessages) {
            return Response.json(
                {
                    success: false,
                    message: "User is not accepting messages"
                },
                {
                    status: 403
                }
            )
        }

        // create a message
        const newMessage = {content, createdAt: new Date()}
        user.messages.push(newMessage as Message)
        await user.save()

        // return res
        return Response.json(
            {
                success: true,
                message: "Message sent successfully",
            },
            {
                status: 200
            }
        )
    } catch (error) {
        console.error("Error while sending message : ", error);
        return Response.json(
            {
                success: false,
                message: "Error while sending message"
            },
            {
                status: 500
            }
        )
    }
}