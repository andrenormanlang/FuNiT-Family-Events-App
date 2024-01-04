import image from '../../assets/images/404-error.gif';
import Box from '@mui/material/Box';

export const FourOFour = () => {
    return (
        <Box className="flex flex-col items-center justify-start">
            <h1 className="text-2xl font-bold"></h1>
            <img src={image} className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto" alt="404 Page" />
        </Box>
    );
};

export default FourOFour;
