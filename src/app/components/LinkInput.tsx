import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface LinkInputProps {
  maxLinks: number;
  label: string;
  onLinksChange: (links: string[]) => void;
  value?: string[];
}

export function LinkInput({ maxLinks, label, onLinksChange, value = [] }: LinkInputProps) {
  const [links, setLinks] = useState<string[]>(value);
  const [currentLink, setCurrentLink] = useState('');

  const addLink = () => {
    if (currentLink.trim() && links.length < maxLinks) {
      const newLinks = [...links, currentLink.trim()];
      setLinks(newLinks);
      onLinksChange(newLinks);
      setCurrentLink('');
    }
  };

  const removeLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
    onLinksChange(newLinks);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm text-gray-700">{label}</label>
      
      <div className="flex gap-2">
        <Input
          type="url"
          value={currentLink}
          onChange={(e) => setCurrentLink(e.target.value)}
          placeholder="https://example.com/video"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addLink();
            }
          }}
          disabled={links.length >= maxLinks}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addLink}
          disabled={!currentLink.trim() || links.length >= maxLinks}
        >
          <Plus size={16} />
        </Button>
      </div>

      {links.length > 0 && (
        <div className="space-y-2">
          {links.map((link, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline truncate flex-1"
              >
                {link}
              </a>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeLink(index)}
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
