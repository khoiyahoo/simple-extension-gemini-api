import { useRef, useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const clearImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async () => {
    setLoading(true);
    try {
      let imageData = "";
      if (image) {
        const reader = new FileReader();
        imageData = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(image);
        });
      }
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${"AIzaSyDQlfOTBlWSwefKdW7SOanGbTJzz2HWYQY"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  question ? { text: question } : null,
                  image
                    ? {
                        inline_data: {
                          data: imageData.split(",")[1],
                          mime_type: image.type,
                        },
                      }
                    : null,
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      setAnswer(data.candidates[0].content.parts[0].text);
    } catch (error) {
      console.error("Error:", error);
      setAnswer("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(e.target.value);
  };
  return (
    <>
      <div className="App">
        <div>
          Question:
          <input
            onChange={handleChangeInput}
            value={question}
            className="input"
          />
        </div>
        <div className="box-input-img">
          Upload image:
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
          />
          {image && (
            <button onClick={clearImage} disabled={loading}>
              Clear Image
            </button>
          )}
        </div>

        <div className="group-btn-control">
          <button onClick={onSubmit} disabled={loading}>
            Submit
          </button>
          <button onClick={() => setQuestion("")} disabled={loading}>
            Clear
          </button>
        </div>
        {!loading ? (
          answer && (
            <div>
              <h3>Answer:</h3>
              <p>{answer}</p>
            </div>
          )
        ) : (
          <>Loading ....</>
        )}
      </div>
    </>
  );
}

export default App;
