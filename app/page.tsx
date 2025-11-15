import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="mb-4 text-5xl font-bold text-gray-900">
            Pet Management App
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Manage your pets with ease. Track their information, photos, and more.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/login">
              <Button size="lg">Login</Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Easy Management</CardTitle>
              <CardDescription>
                Manage all your pets in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Keep track of your pets&apos; names, breeds, birthdays, and more
                with our intuitive interface.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Photo Storage</CardTitle>
              <CardDescription>
                Upload and store pet photos securely
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Store your favorite pet photos safely in the cloud and access
                them anytime.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your data is safe with us
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Built with security in mind. Only you can access your pet
                information.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
