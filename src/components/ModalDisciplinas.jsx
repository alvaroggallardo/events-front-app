import React from 'react';
import {
  Button,
  Modal,
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

/**
 * Modal que muestra todas las disciplinas para seleccionarlas.
 */
export default function ModalDisciplinas({
  open,
  onClose,
  disciplinasOptions,
  disciplinasSeleccionadas,
  toggleDisciplina,
  conteoPorDisciplina,
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: '80vh',
          overflowY: 'auto',
          minWidth: 300,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Selecciona disciplinas
        </Typography>
        <FormGroup>
          {disciplinasOptions.map((disciplina) => {
            const isSelected = disciplinasSeleccionadas.includes(disciplina);
            const count = conteoPorDisciplina[disciplina] || 0;

            return (
              <FormControlLabel
                key={disciplina}
                control={
                  <Checkbox
                    checked={isSelected}
                    onChange={() => toggleDisciplina(disciplina)}
                  />
                }
                label={`${disciplina} (${count})`}
              />
            );
          })}
        </FormGroup>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={onClose}
          fullWidth
        >
          Aceptar
        </Button>
      </Box>
    </Modal>
  );
}
