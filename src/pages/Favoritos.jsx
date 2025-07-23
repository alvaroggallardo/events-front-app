import React from 'react';
import { Box, Typography, Button } from '@mui/material';

export default function Favoritos() {
  const handleClick = () => {
    window.open('https://www.linkedin.com/in/alvarogonzalezgallardo', '_blank');
  };

  return (
    <Box textAlign="center" p={3} bgcolor="#fff" minHeight="100vh">
      <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
        Gracias a Helena por aguantarme e inspirarme
      </Typography>

      <Box
        component="img"
        src="/assets/images/helena.png"
        alt="Helena"
        sx={{ width: 200, height: 200, objectFit: 'contain', mb: 3 }}
      />

      <Button
        variant="outlined"
        color="primary"
        onClick={handleClick}
        sx={{ fontWeight: 'bold' }}
      >
        Contacta conmigo aquí
      </Button>
    </Box>
  );
}
