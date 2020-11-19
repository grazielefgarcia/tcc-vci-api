const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const Question = require("../database/models/questions");
const Perguntados = require("../database/models/perguntados");
const Game = require("../database/models/game");
const { db } = require("../config/objetos");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

router.get("/all", async function (req, res) {
    try {
        Perguntados.findAll()
            .then(function (resultados) {
                res.json(resultados);
            })
            .catch(function () {
                throw new Error("Erro ao procurar todas as categorias");
            });
    } catch (e) {
        res.json({
            success: false,
            message: e.message
        });
    }
});

router.get("/get-all-questions", async function (req, res) {
    try {
        const result = await db
            .query(
                `
            SELECT idquestion,
            json_question->'enunciado' AS enunciado,
            json_question->'respostas'->'q1' AS q1,
            json_question->'respostas'->'q2' AS q2,
            json_question->'respostas'->'q3' AS q3,
            json_question->'respostas'->'q4' AS q4,
            json_question->'key' AS key FROM questions
        `
            )
            .then((resultado) =>
                res.json({ success: true, questions: resultado[0] })
            )
            .catch((err) =>
                res.json({ success: false, code: err.original.code })
            );
    } catch (e) {
        res.json({
            success: false,
            message: e.message
        });
    }
});

router.put("/update-questions", async function (req, res) {
    try {
        Question.destroy({
            truncate: true
        })
            .then(async () => {
                const game = await Game.findOne({
                    attributes: ['idgame'],
                    where: {
                        name_game: 'Perguntados',
                    }
                }).then(game => game.idgame);
                Question.bulkCreate(
                    req.body.questions.map((q) => {
                        return {
                            totem_fk: q.categoria,
                            json_question: {
                                enunciado: q.enunciado,
                                respostas: {
                                    q1: q.respostas.q1,
                                    q2: q.respostas.q2,
                                    q3: q.respostas.q3,
                                    q4: q.respostas.q4
                                },
                                key: q.key
                            },
                            idgame: game
                        };
                    })
                )
                    .then((result) => {
                        res.json({
                            success: true,
                            result: result,
                            message: "Questões atualizadas com sucesso!"
                        });
                    })
                    .catch((err) => {
                        // console.log(err);
                        throw new Error("Erro ao inserir novas questões");
                    });
            })
            .catch((err) => {
                // console.log(err);
                throw new Error("Erro ao deletar questões existentes");
            });
    } catch (e) {
        res.json({
            success: false,
            message: e.message
        });
    }
});

router.get("/:id", async function (req, res) {
    console.log(req.params);
    const questions = {
        totem_fk: req.params.id
    };

    const result = await Question.findAll({
        where: {
            totem_fk: questions.totem_fk
        }
    }).catch(function (err) {
        res.json({
            success: "false",
            message: "Erro!"
        });
    });

    if (result.length > 0) {
        var busca = result.map((value, index) => {
            return value.dataValues;
        });

        var sort = Math.floor(Math.random() * busca.length);
        return res.status(200).json({
            success: "true",
            message: "Pergunta selecionada",
            data: busca[sort]
        });
    }

    console.log(result);
});

router.get("/pergunta/:id", async function (req, res) {
    const questions = {
        idquestion: req.params.id
    };

    const result = await Question.findAll({
        where: {
            idquestion: questions.idquestion
        }
    }).catch(function (err) {
        res.json({
            success: "false",
            message: "Erro!"
        });
    });
    if (result.length > 0) {
        // var busca = result.map((value, index)=>{
        //     return value.dataValues;
        // });

        // var sort = Math.floor((Math.random()*(busca.length)));
        return res.status(200).json({
            success: "true",
            message: "Pergunta selecionada",
            data: result
        });
    }
});



module.exports = router;
