import { create } from "zustand";

type Step = "service" | "staff" | "datetime" | "info" | "confirm" | "success";

interface BookingForm {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface BookingState {
  step: Step;
  selectedService: any | null;
  selectedStaff: any | null;
  selectedDate: Date | null;
  selectedSlot: string | null;
  weekOffset: number;
  form: BookingForm;
  setStep: (step: Step) => void;
  setSelectedService: (service: any | null) => void;
  setSelectedStaff: (staff: any | null) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedSlot: (slot: string | null) => void;
  setWeekOffset: (offset: number | ((w: number) => number)) => void;
  setForm: (form: Partial<BookingForm> | ((prev: BookingForm) => BookingForm)) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  step: "service",
  selectedService: null,
  selectedStaff: null,
  selectedDate: null,
  selectedSlot: null,
  weekOffset: 0,
  form: { name: "", phone: "", email: "", notes: "" },

  setStep: (step) => set({ step }),
  setSelectedService: (selectedService) => set({ selectedService }),
  setSelectedStaff: (selectedStaff) => set({ selectedStaff }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setSelectedSlot: (selectedSlot) => set({ selectedSlot }),
  setWeekOffset: (weekOffset) =>
    set((state) => ({
      weekOffset: typeof weekOffset === "function" ? weekOffset(state.weekOffset) : weekOffset,
    })),
  setForm: (formUpdate) =>
    set((state) => ({
      form:
        typeof formUpdate === "function"
          ? formUpdate(state.form)
          : { ...state.form, ...formUpdate },
    })),
  reset: () =>
    set({
      step: "service",
      selectedService: null,
      selectedStaff: null,
      selectedDate: null,
      selectedSlot: null,
      weekOffset: 0,
      form: { name: "", phone: "", email: "", notes: "" },
    }),
}));
