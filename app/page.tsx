"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

type Exercise = {
  first: number;
  second: number;
};

type ExerciseResult = {
  number: number;
  correct: boolean;
  points: number;
  seconds: number;
};

function generateExercise(): Exercise {
  return {
    first: Math.floor(Math.random() * 90) + 10,
    second: Math.floor(Math.random() * 90) + 10,
  };
}

function getPoints(seconds: number): number {
  if (seconds < 30) return 10;
  if (seconds <= 45) return 9;
  if (seconds <= 60) return 8;
  return 7;
}

export default function Home() {
  const [exercise, setExercise] = useState<Exercise>({
    first: 38,
    second: 27,
  });

  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [checked, setChecked] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"exercise" | "instruction">("exercise");
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [results, setResults] = useState<ExerciseResult[]>([]);

  const questionStartedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!started || checked || finished) return;

    const timer = setInterval(() => {
      if (questionStartedAt.current !== null) {
        const seconds = Math.floor(
          (Date.now() - questionStartedAt.current) / 1000,
        );
        setElapsedSeconds(seconds);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [started, checked, finished]);

  function startExercises() {
    setExercise(generateExercise());
    setAnswer("");
    setScore(0);
    setCompleted(0);
    setChecked(false);
    setMessage("");
    setFinished(false);
    setResults([]);
    setElapsedSeconds(0);

    questionStartedAt.current = Date.now();

    setStarted(true);
    setTab("exercise");
  }

  function checkAnswer() {
    if (checked || finished || !started) return;

    if (answer.trim() === "") {
      setMessage("Введіть відповідь.");
      return;
    }

    const seconds =
      questionStartedAt.current === null
        ? 0
        : Math.floor((Date.now() - questionStartedAt.current) / 1000);

    const correctAnswer = exercise.first + exercise.second;
    const isCorrect = Number(answer) === correctAnswer;
    const points = isCorrect ? getPoints(seconds) : 0;

    setChecked(true);
    setCompleted((value) => value + 1);
    setElapsedSeconds(seconds);

    setResults((previous) => [
      ...previous,
      {
        number: completed + 1,
        correct: isCorrect,
        points,
        seconds,
      },
    ]);

    if (isCorrect) {
      setScore((value) => value + points);
      setMessage(`Правильно! Ви отримали ${points} балів. Час: ${seconds} с.`);
    } else {
      setMessage(`Неправильно. Правильна відповідь: ${correctAnswer}.`);
    }
  }

  function nextExercise() {
    if (!checked) return;

    if (completed >= 5) {
      setFinished(true);
      setStarted(false);
      return;
    }

    setExercise(generateExercise());
    setAnswer("");
    setMessage("");
    setChecked(false);
    setElapsedSeconds(0);

    questionStartedAt.current = Date.now();
  }

  function restart() {
    startExercises();
  }

  const timerColor =
    elapsedSeconds < 30
      ? "#16803c"
      : elapsedSeconds <= 45
        ? "#c49a00"
        : elapsedSeconds <= 60
          ? "#e87520"
          : "#d62828";

  return (
    <div className={styles.site}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>∑</span>
            <span>
              <strong>Математика онлайн</strong>
              <small>Вивчай математику легко!</small>
            </span>
          </Link>

          <nav className={styles.navigation}>
            <a href="#exercises">Вправи</a>
            <a href="#about">Калькулятори</a>
            <a href="#about">Довідник</a>
            <a href="#about">Таблиці і формули</a>
          </nav>
        </div>
      </header>

      <main className={styles.container}>
        <div className={styles.breadcrumb}>
          Головна / Математика / Вправи / Арифметика
        </div>

        <h1>Вправи. Додавання в стовпчик двозначних чисел</h1>

        <p className={styles.description}>
          Ці вправи дозволять перевірити, як ви вмієте складати в стовпчик
          двозначні числа.
        </p>

        <p className={styles.description}>
          Розв&apos;язання задач і вправ — найкращий спосіб перевірити свої
          знання і закріпити вивчений матеріал!
        </p>

        <section id="exercises" className={styles.exerciseSection}>
          <div className={styles.tabs}>
            <button
              className={tab === "exercise" ? styles.activeTab : ""}
              onClick={() => setTab("exercise")}
            >
              Вправи
            </button>

            <button
              className={tab === "instruction" ? styles.activeTab : ""}
              onClick={() => setTab("instruction")}
            >
              Інструкція
            </button>
          </div>

          {tab === "instruction" ? (
            <div className={styles.instruction}>
              <h2>Інструкція до вправ</h2>

              <ol>
                <li>Завдання складається із 5 прикладів.</li>

                <li>
                  Щоб розпочати виконання завдань, натисніть кнопку початку.
                </li>

                <li>
                  Щоб ввести відповідь, використовуйте клавіатуру
                  <div className={styles.numericKeyboard}>
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(
                      (digit) => (
                        <div key={digit} className={styles.numericKey}>
                          {digit}
                        </div>
                      ),
                    )}

                    <div className={styles.numericKey}>0</div>

                    <div className={styles.numericKey}>
                      <svg viewBox="0 0 64 44" className={styles.deleteIcon}>
                        <path d="M17 5 H57 V39 H17 L2 22 Z" fill="#171717" />

                        <path
                          d="M29 14 L43 28 M43 14 L29 28"
                          stroke="#ffffff"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                  або цифрові клавіші на ноутбуці чи комп&apos;ютері.
                </li>

                <li>
                  Введіть відповідь і натисніть кнопку «Перевірити». Після
                  переходу до нового завдання повернутися до попереднього
                  прикладу буде неможливо.
                </li>

                <li>
                  Після кожної відповіді ви побачите результат і набрані бали.
                </li>

                <li>
                  За правильну відповідь нараховуються бали залежно від часу:
                  <ul>
                    <li>менше 30 секунд — 10 балів;</li>
                    <li>від 30 до 45 секунд — 9 балів;</li>
                    <li>від 46 до 60 секунд — 8 балів;</li>
                    <li>більше 60 секунд — 7 балів.</li>
                  </ul>
                </li>

                <li>Після виконання 5 завдань ви побачите свій результат.</li>

                <li>
                  Щоб покращити результат, натисніть кнопку «Спробувати знову».
                </li>
              </ol>
            </div>
          ) : (
            <div className={styles.exerciseContent}>
              <h2>Знайдіть значення суми двох чисел:</h2>

              {finished ? (
                <div className={styles.finished}>
                  <h2>Вправи завершено!</h2>

                  <p>
                    Ваш результат: <strong>{score} з 50 балів.</strong>
                  </p>

                  <p>
                    Правильно виконано:{" "}
                    {results.filter((item) => item.correct).length} з 5 завдань.
                  </p>

                  <div className={styles.statistics}>
                    {results.map((item) => (
                      <div key={item.number}>
                        Завдання {item.number}:{" "}
                        {item.correct ? "Правильно" : "Неправильно"} —{" "}
                        {item.points} балів, {item.seconds} с
                      </div>
                    ))}
                  </div>

                  <button onClick={restart} className={styles.primaryButton}>
                    Спробувати знову
                  </button>
                </div>
              ) : !started ? (
                <div className={styles.finished}>
                  <p>
                    Вам потрібно розв&apos;язати 5 прикладів на додавання
                    двозначних чисел.
                  </p>

                  <p>
                    За правильні відповіді ви отримаєте від 7 до 10 балів
                    залежно від часу виконання.
                  </p>

                  <button
                    onClick={startExercises}
                    className={styles.primaryButton}
                  >
                    Почати виконання
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.statistics}>
                    <div>
                      <strong>Завдання:</strong> {completed + (checked ? 0 : 1)}{" "}
                      з 5
                    </div>

                    <div>
                      <strong>Результат:</strong> {score} балів
                    </div>

                    <div>
                      <strong>Час:</strong>{" "}
                      <span style={{ color: timerColor }}>
                        {elapsedSeconds} с
                      </span>
                    </div>
                  </div>

                  <div className={styles.problem}>
  <div className={styles.additionTable}>
    <div className={styles.plusCell}>+</div>

    <div className={styles.numberColumn}>
      <div className={styles.numberCell}>
        {Math.floor(exercise.first / 10)}
      </div>
      <div className={styles.numberCell}>
        {Math.floor(exercise.second / 10)}
      </div>
    </div>

    <div className={styles.numberColumn}>
      <div className={styles.numberCell}>
        {exercise.first % 10}
      </div>
      <div className={styles.numberCell}>
        {exercise.second % 10}
      </div>
    </div>

    <div className={styles.answerCell}></div>
    <div className={styles.answerCell}></div>

    <div className={styles.answerCell}>
      <input
        type="text"
        inputMode="numeric"
        value={answer}
        onChange={(event) =>
          setAnswer(event.target.value.replace(/\D/g, ""))
        }
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            if (checked) {
              nextExercise();
            } else {
              checkAnswer();
            }
          }
        }}
        disabled={checked}
        placeholder="?"
        aria-label="Введіть суму"
      />
    </div>
  </div>
</div>
                  {message && (
                    <div
                      className={`${styles.feedback} ${
                        checked
                          ? Number(answer) === exercise.first + exercise.second
                            ? styles.correct
                            : styles.incorrect
                          : ""
                      }`}
                      role="status"
                    >
                      {message}
                    </div>
                  )}

                  <div className={styles.actions}>
                    {!checked ? (
                      <button
                        onClick={checkAnswer}
                        className={styles.primaryButton}
                      >
                        Перевірити
                      </button>
                    ) : (
                      <button
                        onClick={nextExercise}
                        className={styles.primaryButton}
                      >
                        {completed >= 5
                          ? "Показати результат"
                          : "Наступне завдання"}
                      </button>
                    )}
                  </div>

                  <div className={styles.statistics}>
                    <strong>Результати виконаних завдань:</strong>

                    {results.map((item) => (
                      <div key={item.number}>
                        Завдання {item.number}:{" "}
                        {item.correct ? "Правильно" : "Неправильно"} —{" "}
                        {item.points} балів
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className={styles.footer} id="about">
        Математика онлайн — тренуйся та навчайся!
      </footer>
    </div>
  );
}
