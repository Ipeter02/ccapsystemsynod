import React, { useState, useRef } from 'react';
import { GalleryImage, User, UserRole } from '../types';
import { Plus, X, Trash2, Edit, Image as ImageIcon, Upload, Maximize2, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

interface GalleryProps {
  user: User;
  items: GalleryImage[];
  onSave: (item: GalleryImage) => void;
  onDelete: (id: string) => void;
}

const Gallery: React.FC<GalleryProps> = ({ user, items, onSave, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedViewItem, setSelectedViewItem] = useState<GalleryImage | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [currentItem, setCurrentItem] = useState<Partial<GalleryImage>>({
    url: '', caption: '', category: 'Events'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = user.role === UserRole.SUPER_ADMIN;

  const openModal = (item?: GalleryImage) => {
    if (item) {
      setCurrentItem(item);
    } else {
      setCurrentItem({ id: '', url: '', caption: '', category: 'Events' });
    }
    setUploadProgress(0);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadProgress(5); // Start visual progress

      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        
        // Simulate a smooth upload for visual feedback (since we are local)
        let currentProgress = 5;
        const interval = setInterval(() => {
          currentProgress += 8;
          if (currentProgress >= 100) {
            currentProgress = 100;
            clearInterval(interval);
            setUploadProgress(100);
            // Small delay before showing the image to show 100% complete
            setTimeout(() => {
               setCurrentItem(prev => ({ ...prev, url: result }));
               setUploadProgress(0);
            }, 500);
          } else {
            setUploadProgress(currentProgress);
          }
        }, 50);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem.url) {
      alert("Please select an image from your device.");
      return;
    }

    const itemToSave: GalleryImage = {
      id: currentItem.id || Date.now().toString(),
      url: currentItem.url,
      caption: currentItem.caption || 'Untitled',
      category: currentItem.category || 'General'
    };
    onSave(itemToSave);
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Media Gallery</h2>
          <p className="text-slate-600">Highlights from our events, missions, and community projects.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => openModal()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} className="mr-2" /> Add Photo
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((img) => (
          <div 
            key={img.id} 
            className="group relative overflow-hidden rounded-xl shadow-md bg-white border border-slate-200 cursor-pointer"
            onClick={() => setSelectedViewItem(img)}
          >
            <div className="aspect-w-4 aspect-h-3 overflow-hidden h-64 bg-slate-100 relative">
               <img 
                src={img.url} 
                alt={img.caption} 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                }}
               />
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                 <Maximize2 className="text-white w-8 h-8 drop-shadow-lg" />
               </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 pointer-events-none">
              <span className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">{img.category}</span>
              <h3 className="text-white font-semibold text-lg leading-tight">{img.caption}</h3>
            </div>
            
            {/* Admin Controls (positioned absolutely to be clickable) */}
            {isAdmin && (
              <div className="absolute top-3 right-3 flex space-x-2 z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); openModal(img); }}
                  className="p-2 bg-white/90 text-indigo-600 rounded-full hover:bg-white transition-colors shadow-sm"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setDeleteId(img.id); }}
                  className="p-2 bg-white/90 text-red-600 rounded-full hover:bg-white transition-colors shadow-sm"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            {/* Mobile/Always Visible Caption */}
            <div className="p-4 lg:hidden">
               <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1 block">{img.category}</span>
               <h3 className="text-slate-800 font-semibold">{img.caption}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Detail View Lightbox */}
      {selectedViewItem && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedViewItem(null)}
        >
          <button 
            onClick={() => setSelectedViewItem(null)}
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors z-[110]"
          >
            <X size={36} />
          </button>

          <div 
            className="max-w-6xl w-full max-h-[90vh] bg-white rounded-lg overflow-hidden flex flex-col md:flex-row shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
             <div className="md:w-3/4 bg-black flex items-center justify-center p-4">
                <img 
                  src={selectedViewItem.url} 
                  alt={selectedViewItem.caption} 
                  className="max-h-[85vh] w-auto max-w-full object-contain shadow-lg" 
                />
             </div>
             <div className="md:w-1/4 p-8 flex flex-col bg-white border-l border-slate-100">
                <div className="flex-1 overflow-y-auto">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mb-4">
                      {selectedViewItem.category}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">{selectedViewItem.caption}</h3>
                    <div className="w-10 h-1 bg-indigo-500 rounded-full mb-6"></div>
                    
                    <p className="text-slate-500 text-sm leading-relaxed">
                      "We proclaim the Gospel of Jesus Christ to all people through holistic evangelism."
                    </p>
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-100">
                   <button 
                      onClick={() => setSelectedViewItem(null)}
                      className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Close Gallery View
                    </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">{currentItem.id ? 'Edit Gallery Item' : 'Upload New Photo'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Photo</label>
                <div 
                  onClick={() => {
                    if (uploadProgress === 0) fileInputRef.current?.click();
                  }}
                  className={`group w-full h-48 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors overflow-hidden bg-slate-50 relative ${uploadProgress > 0 ? 'cursor-not-allowed' : ''}`}
                >
                  {uploadProgress > 0 ? (
                    <div className="flex flex-col items-center justify-center w-full h-full bg-slate-50 px-8 animate-fade-in z-10">
                      <div className="flex items-center justify-between w-full mb-2">
                         <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                         <span className="text-xs font-bold text-indigo-600">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-indigo-600 transition-all duration-100 ease-out"
                           style={{ width: `${uploadProgress}%` }}
                         />
                      </div>
                      <span className="text-xs text-slate-400 mt-2">Uploading image...</span>
                    </div>
                  ) : currentItem.url ? (
                    <>
                      <img src={currentItem.url} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white px-3 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center">
                          <RefreshCw size={12} className="mr-1" /> Change Photo
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-sm text-slate-500">Click to upload from device</span>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploadProgress > 0}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Caption / Title</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Sunday Service Choir"
                  value={currentItem.caption}
                  onChange={e => setCurrentItem({...currentItem, caption: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  value={currentItem.category}
                  onChange={e => setCurrentItem({...currentItem, category: e.target.value})}
                >
                  <option value="Events">Events</option>
                  <option value="Buildings">Buildings & Infrastructure</option>
                  <option value="Community">Community Outreach</option>
                  <option value="Projects">Projects</option>
                  <option value="Youth">Youth Ministry</option>
                  <option value="Worship">Worship & Service</option>
                </select>
              </div>

              <div className="pt-4 flex space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={uploadProgress > 0}
                  className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${uploadProgress > 0 ? 'bg-indigo-400 cursor-not-allowed text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                >
                  {currentItem.id ? 'Update Item' : 'Upload Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Photo</h3>
            <p className="text-slate-500 mb-6">
              Are you sure you want to delete this photo? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;