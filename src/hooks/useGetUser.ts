import useGetDocument from './useGetDocument'
import { usersCol } from '../services/firebase'
import { UserInfo } from '../types/User.types'

const useGetUser = (uid: string) => {
	return useGetDocument<UserInfo>(usersCol, uid)
}

export default useGetUser
