import { useId, useRef } from 'react';

export type AddContactProps = {
  onContactAdd: (name: string, city: string) => void;
};

export default function AddContact({ onContactAdd }: AddContactProps) {
  const nameInputId = useId();
  const cityInputId = useId();

  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    const trimmedName = formData.get('name')?.toString().trim();
    const trimmedCity = formData.get('city')?.toString().trim();

    console.log({ trimmedName, trimmedCity });

    if (!trimmedName || !trimmedCity) return;

    onContactAdd(trimmedName, trimmedCity);

    formRef.current?.reset();
  }

  return (
    <div className="mx-auto max-w-md w-full mb-12">
      <form
        action={handleSubmit}
        ref={formRef}
        className="p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700"
      >
        <div className="mb-4">
          <label htmlFor={nameInputId} className="block text-sm font-medium text-gray-300 mb-1">
            Name
          </label>
          <input
            id={nameInputId}
            name="name"
            type="text"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-100 placeholder-gray-400"
            placeholder="Enter name"
          />
        </div>

        <div className="mb-5">
          <label htmlFor={cityInputId} className="block text-sm font-medium text-gray-300 mb-1">
            City
          </label>
          <input
            id={cityInputId}
            name="city"
            type="text"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-100 placeholder-gray-400"
            placeholder="Enter city"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors font-medium cursor-pointer"
        >
          Add Contact
        </button>
      </form>
    </div>
  );
}
