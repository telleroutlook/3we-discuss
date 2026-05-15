import { Megaphone, HelpCircle, Lightbulb, Rocket, MessageCircle } from 'lucide-solid';
import type { Component } from 'solid-js';

const iconMap: Record<string, Component<{ size?: number; class?: string }>> = {
  megaphone: Megaphone,
  'help-circle': HelpCircle,
  lightbulb: Lightbulb,
  rocket: Rocket,
  'message-circle': MessageCircle,
};

export default function CategoryIcon(props: { name: string | null; size?: number; class?: string }) {
  const Icon = () => iconMap[props.name || 'message-circle'] || MessageCircle;
  return (
    <span class={props.class}>
      {(() => {
        const Comp = Icon();
        return <Comp size={props.size || 20} />;
      })()}
    </span>
  );
}
