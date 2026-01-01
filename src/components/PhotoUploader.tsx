import React, { useCallback } from 'react';

interface PhotoUploaderProps {
    onUpload: (files: File[]) => void;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onUpload }) => {
    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files).filter((file) =>
                file.type.startsWith('image/')
            );
            if (files.length > 0) onUpload(files);
        },
        [onUpload]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).filter((file) =>
                file.type.startsWith('image/')
            );
            if (files.length > 0) onUpload(files);
        }
    };

    return (
        <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer group"
        >
            <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleChange}
                className="hidden"
                id="photo-upload"
            />
            <label htmlFor="photo-upload" className="cursor-pointer">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📸</div>
                <p className="text-white font-medium text-lg">Fotoğrafları Buraya Sürükle</p>
                <p className="text-white/50 text-sm mt-2">veya seçmek için tıkla</p>
            </label>
        </div>
    );
};

export default PhotoUploader;
