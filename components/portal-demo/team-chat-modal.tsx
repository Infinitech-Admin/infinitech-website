"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import { MessageSquare, Send } from "lucide-react";

interface ChatMessage {
  id: string;
  author: string;
  text: string;
  mine?: boolean;
}

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    author: "Jordan Blake",
    text: "Client Portal Setup is at review, can someone double check the copy?",
  },
  { id: "m2", author: "Alex Rivera", text: "On it, will confirm by EOD." },
];

interface TeamChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamChatModal = ({ isOpen, onClose }: TeamChatModalProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES);
  const [draft, setDraft] = useState("");

  const send = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: `m-${prev.length}`, author: "You", text: draft.trim(), mine: true },
    ]);
    setDraft("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      size="md"
      classNames={{ wrapper: "z-[300]", backdrop: "z-[299]" }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col items-start gap-0.5">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Team chat
              </span>
              <span className="text-xs font-normal text-default-400">
                Demo conversation, nothing is sent for real.
              </span>
            </ModalHeader>
            <ModalBody className="max-h-80 gap-3 overflow-y-auto">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    m.mine
                      ? "ml-auto bg-primary text-white"
                      : "bg-default-100 text-foreground"
                  }`}
                >
                  {!m.mine && (
                    <p className="mb-0.5 text-xs font-medium text-default-400">
                      {m.author}
                    </p>
                  )}
                  <p>{m.text}</p>
                </div>
              ))}
            </ModalBody>
            <ModalFooter className="gap-2">
              <Input
                placeholder="Write a message"
                value={draft}
                onValueChange={setDraft}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <Button
                isIconOnly
                color="primary"
                aria-label="Send message"
                onPress={send}
              >
                <Send className="h-4 w-4" />
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
