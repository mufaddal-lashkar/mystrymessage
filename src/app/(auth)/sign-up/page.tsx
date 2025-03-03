'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import axios, { AxiosError } from "axios"
import React,{ useEffect, useState } from "react"
import { useDebounceCallback } from 'usehooks-ts'
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signupSchema"
import { ApiResponse } from "@/types/ApiResponse"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Divide, Loader2 } from "lucide-react"

const Page = () => {
  const [username, setUsername] = useState('')
  const [usernameMessage, setUsernameMessage] = useState('')
  // const [isUsernameAvailable, setIsUsernameAvailable] = useState(false)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // const [isSubmitted, setIsSubmitted] = useState(false)
  
  const debounced = useDebounceCallback(setUsername, 300)
  const { toast } = useToast()
  const router = useRouter()

  // zod implementation
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    }
  })

  // check username is available
  useEffect(() => {
    const checkUsernameUnique = async () => {
      if(username) {
        setIsCheckingUsername(true)
        setUsernameMessage("")
        // setIsUsernameAvailable(false)
        try {
          const response = await axios.get(`/api/check-username-unique?username=${username}`)
          setUsernameMessage(response.data.message)
          // setIsUsernameAvailable(true)
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>
          setUsernameMessage(axiosError.response?.data.message ?? "Error while checking username")
          // setIsUsernameAvailable(false)
        } finally {
          setIsCheckingUsername(false)
        }
      }
    }
    checkUsernameUnique()
  },[username])

  // submit handler
  const onSubmit = async (data:z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true)
    try {
      const response = await axios.post<ApiResponse>("/api/sign-up", data)
      toast({
        title: "Signup success",
        description: response.data.message,
      })
      router.replace(`/verify/${username}`)
    } catch (error) {
      console.error("Error in signup of user : ", error);
      const axiosError = error as AxiosError<ApiResponse>
      let errorMessage = axiosError.response?.data.message
      toast({
        title: "Signup failed",
        description: errorMessage ?? "Error while signing up",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">Join Mystry Message</h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} onChange={(e) => {
                        field.onChange(e)
                        debounced(e.target.value)
                      }}/>
                    </FormControl>
                    {isCheckingUsername && <><div className="flex items-center"><Loader2 className="animate-spin h-4 w-4"/><p className="text-xs">Checking for available username</p></div></>}
                    {/* {isUsernameAvailable ? <p className="text-green-700">Username is available</p> : <p className="text-red-500">Username is not available</p>} */}
                    <p className={`text-sm ${usernameMessage === "Username is available" ? 'text-green-500' : 'text-red-500'}`}>{usernameMessage}</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email" {...field}/>
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="password" {...field}/>
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting }>{isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin">Please wait</Loader2></>) : "Signup"}</Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>Already a member?{' '}<Link href="/sign-in" className="text-blue-600 hover:text-blue-800">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}

export default Page