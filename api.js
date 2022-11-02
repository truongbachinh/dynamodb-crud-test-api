const db =  require('./db')
const {
    GetItemCommand,
    PutItemCommand,
    DeleteItemCommand,
    UpdateItemCommand,
    ScanCommand
} = require('@aws-sdk/client-dynamodb')

const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb')

const getPost = async (event) => {
    const response = { statusCode: 200 }

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ postId: event.pathParameters.postId })
        };
        const { Item } = await db.send(new GetItemCommand(params))
        console.log("🚀 ~ getPost ~ Item", Item)

        response.body = JSON.stringify({
            message: "Successfully retrieved post.",
            data: (Item) ? unmarshall(Item) : {},
            rawData: Item,
        })
    } catch (error) {
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to get post.",
            errorMsg: error.message,
            errorStack: error.stack
        })
        
    }
    return response
}

const createPost = async (event) => {
    const response = { statusCode: 200 }

    try {
        const body = JSON.parse(event.body)
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: marshall(body || {})
        };
        const createResult = await db.send(new PutItemCommand(params))
        console.log("🚀 ~ createPost ~ createResult", createResult)
       

        response.body = JSON.stringify({
            message: "Successfully created post.",
            createResult,
        })
    } catch (error) {
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to post post.",
            errorMsg: error.message,
            errorStack: error.stack
        })
        
    }
    return response
}

const updatePost = async (event) => {
    const response = { statusCode: 200 }

    try {
        const body = JSON.parse(event.body)
        const objKeys = Object.keys(body)
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({postId: event.pathParameters.postId}),
            UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
            ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), {}),
            ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: body[key],
            }), {})),
        };
        const updateResult = await db.send(new UpdateItemCommand(params))
        console.log("🚀 ~ updatePost ~ updateResult", updateResult)
       

        response.body = JSON.stringify({
            message: "Successfully updated post.",
            updateResult,
        })
    } catch (error) {
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to update post.",
            errorMsg: error.message,
            errorStack: error.stack
        })
        
    }
    return response
}

const deletePost = async (event) => {
    const response = { statusCode: 200 }

    try {
        const body = JSON.parse(event.body)
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({postId: event.pathParameters.postId})
        };
        const deleteResult = await db.send(new DeleteItemCommand(params))
        console.log("🚀 ~ deleteResult ~ deleteResult", deleteResult)
       

        response.body = JSON.stringify({
            message: "Successfully deleted post.",
            deleteResult,
        })
    } catch (error) {
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to delete post.",
            errorMsg: error.message,
            errorStack: error.stack
        })
        
    }
    return response
}

const getAllPosts = async (event) => {
    const response = { statusCode: 200 }

    try {
        const { Items } = await db.send(new ScanCommand({TableName: process.env.DYNAMODB_TABLE_NAME}))
        console.log("🚀 ~ getAllPosts ~ Items", Items)

        response.body = JSON.stringify({
            message: "Successfully retrieve all post.",
            data: Items.map((item) => unmarshall(item)),
            rawData: Items
        })
    } catch (error) {
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to  retrieve all  post.",
            errorMsg: error.message,
            errorStack: error.stack
        })
        
    }
    return response
}
module.exports = {
    getPost,
    deletePost,
    createPost,
    updatePost,
    getAllPosts
}