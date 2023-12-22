import { CollectionReference, doc, getDoc } from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'

const useGetDocument = <T>(colRef: CollectionReference<T>, documentId: string) => {
	const [data, setData] = useState<T|null>(null)
	const [error, setError] = useState(false)
	const [loading, setLoading] = useState(true)

	const getData = useCallback(async () => {
		setError(false)
		setLoading(true)

		const docRef = doc(colRef, documentId)
		const docSnapshot = await getDoc(docRef)

		if (!docSnapshot.exists()) {
			setData(null)
			setError(true)
			setLoading(false)
			return
		}

		const data: T = {
			...docSnapshot.data(),
			_id: docSnapshot.id
		}

		setData(data)
		setLoading(false)
	}, [colRef, documentId])

	useEffect(() => {
		if (documentId) {
			getData()
		}
	}, [documentId, getData])

	return {
		data,
		error,
		getData,
		loading,
	}
}

export default useGetDocument
