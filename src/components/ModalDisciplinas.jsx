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
 *
 * Props:
 * - open: si el modal está abierto
 * - onClose: función para cerrar el modal
 * - disciplinasOptions: lista de nombres de disciplinas
 * - disciplinasSeleccionadas: array de disciplinas seleccionadas
 * - toggleDisciplina: función para añadir/quitar disciplina
 * - conteoInicial: objeto { disciplina: cantidad }
 * - disciplinaColors: objeto { disciplina: color }
 */
export default function ModalDisciplinas({
  open,
  onClose,
  disciplinasOptions,
  disciplinasSeleccionadas,
  toggleDisciplina,
  conteoInicial,
  disciplinaColors
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
            const count = conteoInicial[disciplina] || 0;
            const color = '#4285F4';

            return (
              <FormControlLabel
                key={disciplina}
                control={
                  <Checkbox
                    checked={isSelected}
                    onChange={() => toggleDisciplina(disciplina)}
                    sx={{
                      color,
                      '&.Mui-checked': {
                        color,
                      }
                    }}
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
