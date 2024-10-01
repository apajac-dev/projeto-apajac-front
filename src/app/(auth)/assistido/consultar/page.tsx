"use client";

import { ModalConsultaAssistido } from "@/components/modal/modalConsultaAssistido";
import {
  useModalConsultaAssistido,
  useModalConsultaAssistidoContext as useModalContext,
} from "@/hooks/useModalConsultaAssistido";

import BuscarAssistido from "@/components/buscar_assistido/buscarAssistido";
import { useCallback } from "react";

const ConsultarAssistido = () => {
  const modal = useModalConsultaAssistido();

  const handleAssistidoSelect = useCallback((id: string) => {
    modal.setIsOpen(true);
    modal.setId(id);
  }, []);

  return (
    <>
      <BuscarAssistido onSelectCallback={(id) => handleAssistidoSelect(id)} />

      {modal && modal.isOpen && modal.id && (
        <useModalContext.Provider value={modal}>
          <ModalConsultaAssistido />
        </useModalContext.Provider>
      )}
    </>
  );
};
export default ConsultarAssistido;
