"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ConversationMessage, BasicInfo, ConstructionFormData } from "@/lib/construction-types";

interface ConversationFlowProps {
  conversation: ConversationMessage[];
  currentQuestion: string;
  currentAnswer: string;
  setCurrentAnswer: (answer: string) => void;
  isReadyToEstimate: boolean;
  loading: boolean;
  onSubmitAnswer: () => void;
  onBackToForm: () => void;
  basicInfo: BasicInfo;
  formData: ConstructionFormData;
}

export function ConversationFlow({
  conversation,
  currentQuestion,
  currentAnswer,
  setCurrentAnswer,
  isReadyToEstimate,
  loading,
  onSubmitAnswer,
  onBackToForm,
  basicInfo,
  formData,
}: ConversationFlowProps) {
  return (
    <>
      {/* Basic Info Display */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold mb-3">Project Information</h3>
        <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg">
          <div><strong>Project:</strong> {basicInfo.projectName || formData.projectName || 'Unnamed'}</div>
          <div><strong>Type:</strong> {basicInfo.projectType || formData.projectType || 'Not specified'}</div>
          <div><strong>Size:</strong> {basicInfo.squareFootage || formData.squareFootage || 'N/A'} sq ft</div>
          <div><strong>Location:</strong> {basicInfo.location || formData.location || 'Not specified'}</div>
          <div><strong>Province:</strong> {basicInfo.province || formData.province || 'Not specified'}</div>
        </div>
      </div>

      {/* Conversational Q&A Flow */}
      <div className="border-t pt-4 mt-4">
        <h3 className="text-sm font-semibold mb-3">Answer Questions for Accurate Quote</h3>

        {/* Conversation History */}
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto bg-gray-50 p-4 rounded-lg">
          {conversation.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === 'assistant'
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-green-100 text-green-900'
              }`}>
                <div className="text-xs font-semibold mb-1">
                  {msg.role === 'assistant' ? 'Assistant' : 'You'}
                </div>
                <div className="text-sm">{msg.content}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Current Question */}
        {currentQuestion && !isReadyToEstimate && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-semibold text-blue-900 mb-2">Current Question:</div>
            <div className="text-base text-blue-800">{currentQuestion}</div>
          </div>
        )}

        {/* Answer Input */}
        {!isReadyToEstimate && currentQuestion && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Answer:</label>
            <Input
              placeholder="Type your answer here..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmitAnswer();
                }
              }}
              disabled={loading}
            />
            <Button
              onClick={onSubmitAnswer}
              disabled={loading || !currentAnswer.trim()}
              className="w-full"
            >
              {loading ? 'Getting Next Question...' : 'Submit Answer'}
            </Button>
          </div>
        )}

        {/* Ready to Estimate */}
        {isReadyToEstimate && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm font-semibold text-green-900 mb-2">Ready to Generate Estimate</div>
            <div className="text-sm text-green-700 mb-3">
              We have all the information needed. Generating your estimate...
            </div>
          </div>
        )}

        <Button
          onClick={onBackToForm}
          variant="outline"
          className="w-full mt-4"
        >
          Back to Form Mode
        </Button>
      </div>
    </>
  );
}
