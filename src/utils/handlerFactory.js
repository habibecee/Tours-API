/* 
Ör: Bir belgeyi silme işlemi proje içerisinde sadece model ismi değişerek defalarca yazılarak kod tekrarına sebep oluyor.
* Bu sorunu çözmek için hangi model üzerinde işlem yapılacağını parametre olarak alan bir fonksiyon yazıp kod tekrarı önlenecek 
* (Factory Pattern) 
*/

import catchAsync from "./catchAsync.js";
import { NotFound } from "./error.js";
import APIFeatures from "./apiFeatures.js";

// DELETE
export const deleteOne = (Model) =>
  catchAsync(async (req, res) => {
    const found = await Model.findByIdAndDelete(req.params.id);

    if (!found) {
      throw new NotFound();
    }

    res.status(204).json({
      status: "İçerik kaldırıldı",
    });
  });

// UPDATE
export const updateOne = (Model) =>
  catchAsync(async (req, res) => {
    const found = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!found) {
      throw new NotFound();
    }

    res.status({
      status: "İçerik güncellendi",
      data: found,
    });
  });

// CREATE
export const createOne = (Model) =>
  catchAsync(async (req, res) => {
    const newDocument = await Model.create(req.body);

    res.status(201).json({
      status: "İçerik oluşturuldu",
      data: newDocument,
    });
  });

// GET ONE
export const getOne = (Model, populateOptions) =>
  catchAsync(async (req, res) => {
    let query = Model.findById(req.params.id);

    if (populateOptions) {
      query = query.populate(populateOptions);
    }

    const found = await query;

    if (!found) {
      throw new NotFound();
    }

    res.status(200).json({
      status: "İçerik getirildi",
      data: found,
    });
  });

// GET ALL
export const getAll = (Model) =>
  catchAsync(async (req, res) => {
    const features = new APIFeatures(Model.find(), req.query, req.parsedQuery)
      .filter()
      .sort()
      .select()
      .pagination();

    const docs = await features.query;

    res.status(200).json({
      message: "İçerikler listelendi",
      results: docs.length,
      data: docs,
    });
  });
