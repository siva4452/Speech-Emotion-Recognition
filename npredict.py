import sys
import joblib
import librosa
import numpy as np
import soundfile
import warnings

warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", category=DeprecationWarning)

def extract_feature(file_name, mfcc, chroma, mel):
    try:
        with soundfile.SoundFile(file_name) as sound_file:
            X = sound_file.read(dtype="float32")
            sample_rate = sound_file.samplerate
            if chroma:
                stft = np.abs(librosa.stft(X))
            result = np.array([])
            if mfcc:
                mfccs = np.mean(librosa.feature.mfcc(y=X, sr=sample_rate, n_mfcc=40).T, axis=0)
                result = np.hstack((result, mfccs))
            if chroma:
                chroma = np.mean(librosa.feature.chroma_stft(S=stft, sr=sample_rate).T, axis=0)
                result = np.hstack((result, chroma))
            if mel:
                mel = np.mean(librosa.feature.melspectrogram(y=X, sr=sample_rate).T, axis=0)
                result = np.hstack((result, mel))
        return result
    except Exception as e:
        print(f"Error extracting features: {e}")
        sys.exit(1)

if __name__ == "__main__":
    try:
        # Get file names from command-line arguments
        audio_file = 'temp_audio.wav'
        model_file = 'trained_model.pkl'

        loaded_model = joblib.load(model_file)
        test = extract_feature(audio_file, mfcc=True, chroma=True, mel=True)
        res = loaded_model.predict([test])[0]
        print("Mood:", res)
    except Exception as e:
        print(f"Error predicting mood: {e}")
        sys.exit(1)
