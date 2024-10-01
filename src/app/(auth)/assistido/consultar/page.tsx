"use client";

import { useEffect, useState, FormEvent, useRef } from 'react';
import FormTitle from "@/components/titles/form/form";
import * as icon from "react-flaticons";
import styles from "./page.module.css";
import {
  ToastOptions,
  getListaAssistidos,
  getListaAssistidosPorNome,
} from "@/api/endpoints";
import { ModalConsultaAssistido } from "@/components/modal/modalConsultaAssistido";
import {
  useModalConsultaAssistido,
  useModalConsultaAssistidoContext as useModalContext,
} from "@/hooks/useModalConsultaAssistido";
import Loader from "@/common/loader/loader";
import { ListAssistido } from "@/types/listAssistido.type";
import { TooltipCustom } from "@/components/ui/tooltip";

type SortBy = "name" | "status" | "age"; // "responsible" removed due to back issues

export default function ConsultarAssistido() {
  const [assistidos, setAssistidos] = useState<ListAssistido[]>([]);
  const [page, setPage] = useState<number>(0);
  const [isLastPage, setIslastPage] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [orderByAsc, setOrderByAsc] = useState(true);
  const [searchByName, setSearchByName] = useState<string | undefined>(undefined);
  const [toastOptions, setToastOptions] = useState<ToastOptions | undefined>(undefined);
  const inputNameRef = useRef<HTMLInputElement | null>(null);
  const observerRef = useRef(null);

  const modal = useModalConsultaAssistido();

  useEffect(() => {
    if (isLastPage) return;

    setIsLoading(true); // Comece a carregar os dados

    const fetchAssistidos = async () => {
      try {
        const data = !!searchByName
          ? await getListaAssistidosPorNome(searchByName, page, sortBy, orderByAsc, toastOptions)
          : await getListaAssistidos(page, sortBy, orderByAsc, toastOptions);
        setAssistidos((oldArray) => [...oldArray, ...data.assistidos]);
        setIslastPage(data.isLastPage);
      } catch (error) {
        console.error("Erro ao carregar assistidos:", error);
        // Trate o erro, por exemplo, mostrando uma mensagem de erro
      } finally {
        setIsLoading(false); // Finalize o carregamento
      }
    };

    fetchAssistidos();
  }, [page, sortBy, orderByAsc, searchByName]);

  // Manter a função de manipulação e outras lógicas aqui

  return (
    <div className={styles.container}>
      <FormTitle
        title="Consultar Assistidos"
        Icon={icon.User}
        className={styles.title}
      />

      <form
        aria-label="search by name"
        className={styles.search}
        onSubmit={(e) => {
          e.preventDefault();
          const inputName = inputNameRef.current;
          if (inputName && inputName.value) {
            setSearchByName(inputName.value);
            setAssistidos([]); // Resetar assistidos ao buscar por novo nome
            setIslastPage(false);
            setPage(0);
          }
        }}
      >
        <label htmlFor="search_input">Nome</label>
        <input type="text" id="search_input" minLength={3} ref={inputNameRef} />
        <input
          type="submit"
          className={`button_submit ${isLoading ? styles.disabled : ""}`}
          value="Pesquisar"
          disabled={isLoading}
        />
      </form>

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.name} onClick={() => handleSortChange("name")}>
              Nome
              {sortBy === "name" && (orderByAsc ? <icon.AngleDown size={12} /> : <icon.AngleUp size={12} />)}
            </th>
            <th className={styles.age} onClick={() => handleSortChange("age")}>
              Idade
              {sortBy === "age" && (orderByAsc ? <icon.AngleDown size={12} /> : <icon.AngleUp size={12} />)}
            </th>
            <th className={styles.name} style={{ cursor: "not-allowed" }}>
              Nome do Responsável
            </th>
            <th className={styles.status} onClick={() => handleSortChange("status")}>
              Status
              {sortBy === "status" && (orderByAsc ? <icon.AngleDown size={12} /> : <icon.AngleUp size={12} />)}
            </th>
          </tr>
        </thead>
        <tbody>
          {assistidos.map((assistido) => (
            <tr
              key={assistido.id}
              style={{ cursor: "pointer" }}
              onClick={() => {
                modal.setIsOpen(true);
                modal.setId(assistido.id);
              }}
            >
              <td className={styles.name}>
                <TooltipCustom content={assistido.name}>
                  <p>{assistido.name}</p>
                </TooltipCustom>
              </td>
              <td className={styles.age}>
                <p>{assistido.age}</p>
              </td>
              <td className={styles.name}>
                <TooltipCustom content={assistido.responsible}>
                  <p>{assistido.responsible}</p>
                </TooltipCustom>
              </td>
              <td className={styles.status}>
                <p style={{ color: assistido.status ? "#006600" : "#d9070a" }}>
                  {assistido.status ? "ativo" : "inativo"}
                </p>
              </td>
            </tr>
          ))}
          <tr ref={observerRef}></tr>
        </tbody>
      </table>

      {isLastPage && assistidos.length === 0 && !isLoading && (
        <p>Nenhum assistido encontrado na base de dados.</p>
      )}
      {modal.isOpen && modal.id && (
        <useModalContext.Provider value={modal}>
          <ModalConsultaAssistido />
        </useModalContext.Provider>
      )}
      {isLoading && (
        <p>Carregando assistidos, por favor, aguarde...</p>
      )}
      {!isLastPage && <Loader style={{ margin: "40px 0 25px" }} />}
    </div>
  );
}
