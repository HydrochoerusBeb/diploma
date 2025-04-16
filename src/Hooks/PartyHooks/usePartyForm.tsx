// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { SessionData, Compain, createSession, createSessionFromConfig } from '@/actions/party';
// import { getCompanies } from '@/actions/companyActions';
// import { PartyType } from '@/utils/types/PartyType';

// export function usePartyForm(userId: string | undefined, initialParty: PartyType | null) {
//   const [formState, setFormState] = useState<SessionData>({
//     name: initialParty?.title || '',
//     scenario: initialParty?.description || '',
//     characters: initialParty?.characters || [],
//     charactersString: initialParty?.characters?.join(', ') || '', // Инициализируем строку
//     compainId: initialParty?.compainId || '',
//     userId: '',
//   });
//   const [compains, setCompains] = useState<Compain[]>([]);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     if (userId && formState.userId !== userId) {
//       setFormState((prev) => ({ ...prev, userId }));
//     }
//   }, [userId]);

//   useEffect(() => {
//     async function loadCompains() {
//       if (!userId) return;
//       try {
//         const userCompains = await getCompanies(userId);
//         setCompains(userCompains);
//         if (!formState.compainId && userCompains.length > 0) {
//           setFormState((prev) => ({ ...prev, compainId: userCompains[0].id }));
//         }
//       } catch (err) {
//         console.error('Ошибка загрузки кампаний:', err);
//         alert('Не удалось загрузить кампании');
//       }
//     }
//     loadCompains();
//   }, [userId]);

//   const handleCreate = async () => {
//     console.log('formState перед валидацией:', formState);
//     // Парсим charactersString в массив
//     const characters = formState.charactersString
//       .split(',')
//       .map((c) => c.trim())
//       .filter((c) => c.length > 0);

//     if (!formState.name || !formState.scenario || !characters.length || !formState.userId) {
//       const errors = [];
//       if (!formState.name) errors.push('name пустое');
//       if (!formState.scenario) errors.push('scenario пустое');
//       if (!characters.length) errors.push('characters пустой массив');
//       if (!formState.userId) errors.push('userId пустое');
//       console.log('Ошибки валидации:', errors);
//       alert(`Заполните все поля: ${errors.join(', ')}`);
//       return null;
//     }

//     try {
//       const result = await createSession({
//         ...formState,
//         characters, // Передаём распарсенный массив
//       });
//       return result;
//     } catch (err) {
//       console.error('Ошибка создания сессии:', err);
//       alert(`Не удалось создать сессию: ${err.message}`);
//       return null;
//     }
//   };

//   const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return null;
//     try {
//       const text = await file.text();
//       const config = JSON.parse(text);
//       const result = await createSessionFromConfig(config);
//       setFormState({
//         name: config.sessionData.name,
//         scenario: config.sessionData.scenario,
//         characters: config.sessionData.characters,
//         charactersString: config.sessionData.characters.join(', '),
//         compainId: config.sessionData.compainId,
//         userId: config.sessionData.userId,
//       });
//       if (fileInputRef.current) fileInputRef.current.value = '';
//       return { ...result, config };
//     } catch (err) {
//       console.error('Ошибка импорта:', err);
//       alert('Не удалось загрузить конфиг');
//       return null;
//     }
//   };

//   const handleFormChange = (newFormState: Partial<SessionData>) => {
//     setFormState((prev) => ({
//       ...prev,
//       ...newFormState,
//     }));
//   };

//   return {
//     formState,
//     compains,
//     handleCreate,
//     handleImport,
//     fileInputRef,
//     handleFormChange,
//   };
// }