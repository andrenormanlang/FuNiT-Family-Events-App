// import { Libraries, useLoadScript } from "@react-google-maps/api"
// import Map from "../../components/GuestPages/HomePage/Map"
// import Container from "react-bootstrap/Container"
// import Alert from "react-bootstrap/Alert"
// import Row from 'react-bootstrap/Row'
// import Col from 'react-bootstrap/Col'
// import Button from 'react-bootstrap/Button'
// import Offcanvas from 'react-bootstrap/Offcanvas'
// import { useState } from "react"
// import { Place } from "../../types/Place.types"
// import { MdMenuOpen } from "react-icons/md";
// import RingLoader from "react-spinners/RingLoader";
// import SidebarContent from "../../components/GuestPages/HomePage/SidebarContent"

// // defining used libraries outside page component so
// // it wont rerender and give a performance warning
// const libraries: Libraries = ['places']

// const HomePage = () => {
// 	const [places, setPlaces] = useState<Place[] | null>(null)
// 	const [show, setShow] = useState(false)

// 	// connect to Google Maps API, using the 'places' library
// 	const { isLoaded, loadError } = useLoadScript({
// 		googleMapsApiKey: import.meta.env.VITE_GEOCODE_API_KEY,
// 		libraries: libraries,
// 	})

// 	if (!isLoaded) return (
// 		<Container
// 			style={{
// 				height: '100vh',
// 			}}
// 			className="d-flex justify-content-center align-items-center">
// 			<RingLoader
// 				color="#3B4C73"
// 				size={140}
// 			/>
// 		</Container>
// 	)

// 	if (loadError) return (
// 		<Container
// 			style={{
// 				maxWidth: '34rem',
// 				height: '100vh',
// 			}}
// 			className="d-flex justify-content-center align-items-center">
// 			<Alert variant="warning">
// 				The was an error loading the page. Error: {loadError.message}
// 			</Alert>
// 		</Container>
// 	)

// 	return (
// 		<>
// 			{/* Offcanvas and button to launch it showing in all below large screens */}
// 			<Offcanvas
// 				className="d-block d-lg-none offcanvas"
// 				show={show}
// 				onHide={() => setShow(false)}>
// 				<Offcanvas.Header closeButton>
// 					<Offcanvas.Title>
// 						<span className="h2">
// 							Places
// 						</span>
// 					</Offcanvas.Title>
// 				</Offcanvas.Header>
// 				<Offcanvas.Body>
// 					{places &&
// 						<SidebarContent
// 							places={places}
// 						/>
// 					}
// 				</Offcanvas.Body>
// 			</ Offcanvas>
// 			<Button
// 				className="d-lg-none offcanvas-btn"
// 				variant="secondary"
// 				onClick={() => setShow(true)}
// 			>
// 				<MdMenuOpen />
// 			</Button >

// 			{/* Sidebar showing in all above large screens */}
// 			<Container fluid className="py-3 center-y">
// 				<Row className='d-flex justify-content-center'>
// 					<Col className="d-none d-lg-block places-sidebar" lg={{ span: 3 }} >
// 						<h2>Places</h2>
// 						{places &&
// 							<SidebarContent
// 								places={places}
// 							/>
// 						}
// 					</Col>
// 					<Col lg={{ span: 9 }}>
// 						<Map
// 							placesFound={(placesFound) => setPlaces(placesFound)}
// 						/>
// 					</Col>
// 				</Row>
// 			</Container >
// 		</>
// 	)
// }

// export default HomePage
