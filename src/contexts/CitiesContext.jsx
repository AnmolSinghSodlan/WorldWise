import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";

import { db } from "../config/firebase";
import {
  getDocs,
  collection,
  doc,
  getDoc,
  addDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

const CitiesContext = createContext();

const initialState = {
  isLoading: false,
  cities: [],
  currentCity: {},
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };

    case "cities/loaded":
      return { ...state, isLoading: false, cities: action.payload };

    case "city/loaded":
      return { ...state, isLoading: false, currentCity: action.payload };

    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      };

    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
        currentCity: {},
      };

    case "rejected":
      return { ...state, isLoading: false, error: action.payload };

    default:
      throw new Error("Unknown Action Type");
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState
  );

  useEffect(function () {
    const citiesCollectionRef = collection(db, "cities");

    async function fetchCities() {
      dispatch({ type: "loading" });
      try {
        const res = await getDocs(citiesCollectionRef);
        const data = res.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        dispatch({ type: "cities/loaded", payload: data });
      } catch {
        dispatch({
          type: "rejected",
          payload: "There was an error loading data...",
        });
      }
    }
    fetchCities();
  }, []);

  const getCity = useCallback(
    async function getCity(id) {
      if (id === currentCity.id) return;

      const cityDocRef = doc(db, "cities", id);

      dispatch({ type: "loading" });
      try {
        const res = await getDoc(cityDocRef);
        const data = res.data();
        dispatch({ type: "city/loaded", payload: data });
      } catch {
        dispatch({
          type: "rejected",
          payload: "There was an error loading data...",
        });
      }
    },
    [currentCity.id]
  );

  async function createCity(newCity) {
    const citiesCollectionRef = collection(db, "cities");

    dispatch({ type: "loading" });
    try {
      const newAddedCityRef = await addDoc(citiesCollectionRef, {
        cityName: newCity.cityName,
        country: newCity.country,
        emoji: newCity.emoji,
        date: newCity.date,
        notes: newCity.notes,
        position: { lat: newCity.position.lat, lng: newCity.position.lng },
      });

      const newAddedCityDoc = await getDoc(newAddedCityRef);
      const newAddedCityData = {
        ...newAddedCityDoc.data(),
        id: newAddedCityRef.id,
      };

      const cityDocRef = doc(db, "cities", newAddedCityRef.id);
      await setDoc(cityDocRef, { id: newAddedCityRef.id }, { merge: true });

      dispatch({ type: "city/created", payload: newAddedCityData });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error creating city...",
      });
    }
  }

  async function deleteCity(id) {
    const cityDocRef = doc(db, "cities", id);

    dispatch({ type: "loading" });
    try {
      await deleteDoc(cityDocRef);
      dispatch({ type: "city/deleted", payload: id });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error deleting city...",
      });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        error,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("CitiesContext was used outside the CitiesProvider");
  return context;
}

export { CitiesProvider, useCities };
