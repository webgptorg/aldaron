import { Conversation } from '@/lib/conversations-data';
import * as yaml from 'js-yaml';
import genericConversationYaml from './genericConversation.yaml';

export const genericConversation = yaml.load(genericConversationYaml) as Conversation;
