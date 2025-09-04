
// {
//   "name": "string",
//   "imageUrl": "string",
//   "url": "string",
//   "category": "string",
//   "shortDescription": "string",
//   "longDescription": "string",
//   "changeVsTradition": 0,
//   "compassionVsAmbition": 0,
//   "targetAgeMin": 0,
//   "targetAgeMax": 0,
//   "priceSegment": "Budget"
// }


import React, { useState, useMemo } from "react";
import { brandCategories } from "../assets/uiData/brand_categories_se";

export default function AddBrandForm({ onSubmit, formState = null}) {

    
const categories = useMemo(() => {
    const { all, ...rest } = brandCategories;
    return rest;
  }, []); // empty deps => only runs once

const [formData, setFormData] = useState(() => ({
  name: "",
  imageUrl: "",
  url: "",
  category: "",
  shortDescription: "",
  longDescription: "",
  changeVsTradition: 0,
  compassionVsAmbition: 0,
  targetAgeMin: 0,
  targetAgeMax: 0,
  priceSegment: "Budget",
  ...formState, // overwrite defaults if formState has values
  changeVsTradition: formState?.brandPersonality?.changeVsTradition,
  compassionVsAmbition: formState?.brandPersonality?.changeVsTradition,
}));
  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};

    if (!formData.name) newErrors.name = "Name is required";
    // if (!formData.imageUrl) newErrors.imageUrl = "Image URL is required";
    if (!formData.url) newErrors.url = "URL is required";

    if (!formData.category || !categories[formData.category]) {
      newErrors.category = "Category is required";
    }

    if (
      formData.changeVsTradition < 0 ||
      formData.changeVsTradition > 100
    ) {
      newErrors.changeVsTradition = "Must be between 0 and 100";
    }

    if (
      formData.compassionVsAmbition < 0 ||
      formData.compassionVsAmbition > 100
    ) {
      newErrors.compassionVsAmbition = "Must be between 0 and 100";
    }

    if (formData.targetAgeMin < 0) {
      newErrors.targetAgeMin = "Minimum age must be >= 0";
    }

    if (formData.targetAgeMax < formData.targetAgeMin) {
      newErrors.targetAgeMax =
        "Maximum age must be greater than minimum age";
    }

    if (!formData.priceSegment) {
      newErrors.priceSegment = "Price segment is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      console.log("Form submitted:", formData);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="admin-add-brand-form"
    >
      {formState? <h2>Edit Brand</h2>: <h2>Add Brand</h2>}

      {/* Name */}
      <div className="flex flex-col">
        <label className="font-medium">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        {errors.name && (
          <span className="admin-error-text">{errors.name}</span>
        )}
      </div>

      {/* Image URL */}
      <div className="flex flex-col">
        <label className="font-medium">Image URL</label>
        <input
          type="text"
          name="imageUrl"
          placeholder="OBS Lämna blankt"
        //   disabled="true"
          value={formData.imageUrl}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        {errors.imageUrl && (
          <span className="admin-error-text">{errors.imageUrl}</span>
        )}
      </div>

      {/* URL */}
      <div className="flex flex-col">
        <label className="font-medium">Website URL</label>
        <input
          type="text"
          name="url"
          value={formData.url}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        {errors.url && (
          <span className="admin-error-text">{errors.url}</span>
        )}
      </div>

      {/* Category */}
      <div className="flex flex-col">
        <label className="font-medium">Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">-- Select Category --</option>
          {Object.entries(categories).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        {errors.category && (
          <span className="admin-error-text">{errors.category}</span>
        )}
      </div>

      {/* Short Description */}
      <div className="flex flex-col">
        <label className="font-medium">Short Description</label>
        <input
          type="text"
          name="shortDescription"
          value={formData.shortDescription}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </div>

      {/* Long Description */}
      <div className="flex flex-col">
        <label className="font-medium">Long Description</label>
        <textarea
          name="longDescription"
          rows="4"
          value={formData.longDescription}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </div>

      {/* Numeric Fields */}
      <div className="flex">
        <div>
          <label className="font-medium">Change vs Tradition</label>
          <input
            type="number"
            name="changeVsTradition"
            value={formData.changeVsTradition}
            onChange={handleChange}
            min="0"
            max="100"
            className="numeric p-2 rounded w-full"
          />
          {errors.changeVsTradition && (
            <span className="admin-error-text">
              {errors.changeVsTradition}
            </span>
          )}
        </div>

        <div>
          <label className="font-medium">Compassion vs Ambition</label>
          <input
            type="number"
            name="compassionVsAmbition"
            value={formData.compassionVsAmbition}
            onChange={handleChange}
            min="0"
            max="100"
            className="numeric p-2 rounded w-full"
          />
          {errors.compassionVsAmbition && (
            <span className="admin-error-text">
              {errors.compassionVsAmbition}
            </span>
          )}
        </div>
      </div>

      {/* Target Age */}
      <div className="flex">
        <div>
          <label className="font-medium">Target Age Min</label>
          <input
            type="number"
            name="targetAgeMin"
            value={formData.targetAgeMin}
            onChange={handleChange}
            className="numeric p-2 rounded w-full"
          />
          {errors.targetAgeMin && (
            <span className="admin-error-text">
              {errors.targetAgeMin}
            </span>
          )}
        </div>

        <div>
          <label className="font-medium">Target Age Max</label>
          <input
            type="number"
            name="targetAgeMax"
            value={formData.targetAgeMax}
            onChange={handleChange}
            className="numeric p-2 rounded w-full"
          />
          {errors.targetAgeMax && (
            <span className="admin-error-text">
              {errors.targetAgeMax}
            </span>
          )}
        </div>
      </div>

      {/* Price Segment */}
      <div className="flex flex-col">
        <label className="font-medium">Price Segment</label>
        <select
          name="priceSegment"
          value={formData.priceSegment}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="Budget">Budget</option>
          <option value="Medium">Medium</option>
          <option value="Premium">Premium</option>
          <option value="Luxury">Luxury</option>
        </select>
        {errors.priceSegment && (
          <span className="admin-error-text">
            {errors.priceSegment}
          </span>
        )}
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded shadow"
      >
        Submit
      </button>

    </form>
  );
}
