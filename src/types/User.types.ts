import { Timestamp } from 'firebase/firestore'

export type UserInfo = {
	createdAt: Timestamp
	displayName: string
	email: string,
	isAdmin: boolean
	photoURL: string
	uid: string
	updatedAt: Timestamp
}

export type Login = {
	email: string
	password: string
}

export type SignUp = {
	displayName: string
	email: string
	password: string
	passwordConfirm: string
}

export type UserUpdate = {
    preventDefault(): unknown
	displayName: string
	email: string
	photoFile: FileList
	password: string
	passwordConfirm: string
}

export type ForgotPassword ={
	email: string
}